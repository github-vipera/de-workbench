'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
 import {
   createText,
   createInput,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor
 } from '../element/index';

import { UIComponent, UIBaseComponent } from './UIComponent'
import { UIListView, UIListViewModel } from './UIListView'

const remote = require('remote');
const $ = require("jquery")

export interface UIExtendedListViewValidationResult {
  validationStatus:boolean;
  validationErrorMessage:string;
  showValidationError:boolean;
}

export interface UIExtendedListViewModel extends UIListViewModel {
    isCellEditable(row:number, col:number):boolean;
    onValueChanged(row:number, col:number, value:any);
    onEditValidation(row:number, col:number, value:any):UIExtendedListViewValidationResult;
}

export class UIExtendedListView extends UIListView {

  private selectedCell:HTMLElement;
  private selectedRow:HTMLElement;
  private extendedModel:UIExtendedListViewModel;
  private editorEl:HTMLElement;
  private editing:boolean;

  private validationErrorOverlay:HTMLElement;

  constructor(model:UIExtendedListViewModel){
    super(model);
    this.extendedModel = model;
  }

  protected buildUI(){
    super.buildUI();

    this.editorEl = this.createEditor();
    insertElement(this.mainElement, this.editorEl);

    this.validationErrorOverlay = this.createValidationErrorOverlay();
    insertElement(this.mainElement, this.validationErrorOverlay);
  }

  protected createEditor():HTMLElement{
    let editorEl = createTextEditor({});
    editorEl.style.position = "absolute"
    editorEl.style.visibility = "hidden"
    editorEl.classList.add("de-workbench-listview-tb-editor")
    editorEl.addEventListener('keydown',(evt)=>{
      if (evt.keyCode===13){ //ENTER
        this.commitEditing();
      }
      if (evt.keyCode===27){ //ESC
        this.cancelEditing();
      }
    })
    return editorEl;
  }

  protected createValidationErrorOverlay():HTMLElement {
      let el = createElement('div',{
        elements: [
          createText("Validation Error")
        ],
        className: 'de-workbench-listview-tb-editor-validation-error'
      })
      el.style.position = "absolute"
      el.style.visibility = "hidden"
      return el;
  }

  protected tableReady(table:HTMLElement){
    super.tableReady(table)

    if (!table.getAttribute("tabindex")){
      table.setAttribute("tabindex", "0")
    }

    //add event listeners for selection and editing
    $(table).on('click',(evt)=>{
      evt.preventDefault()
      if (this.isEditing()){
        if (this.commitEditing()){
          this.selectCell(evt.target);
        }
      } else {
        this.selectCell(evt.target);
      }
    })

    $(table).on('dblclick',(evt)=>{
      evt.preventDefault()
      this.selectCell(evt.target);
      this.manageCellEdit(this.selectedCell);
    })

    window.addEventListener('resize', ()=> {
      if (this.isEditing){
        this.moveEditor(this.selectedCell);
      }
    });

    $(table).keydown((evt)=>{
      //console.log("Navigation required")
      this.navigateTableWithKeyboard(evt.which)
    })

    $(table).focusout(()=>{
      this.removeCurrentSelection();
    })

  }

  protected navigateTableWithKeyboard(key:number){
    console.log("navigateTableWithKeyboard " , key)
    if (key == 39) {
        // Right Arrow
        this.navigateRight();
    } else if (key == 37) {
        // Left Arrow
        this.navigateLeft()
    } else if (key == 38) {
        // Up Arrow
        this.navigateUp();
    } else if (key == 40) {
        // Down Arrow
        this.navigateDown()
    } else if (key == 13) {
        // Enter
        this.manageCellEdit(this.selectedCell);
    } else if (key == 27) {
        // ESC
        if (this.isEditing()){
          this.cancelEditing()
        }
    }
  }

  protected navigateRight(){
    console.log("Navigate right")
    if (!this.selectedCell){
      return;
    }
    let c = $(this.selectedCell).next();
    if (c && c[0]){
      this.selectCell(c[0]);
    }
  }

  protected navigateLeft(){
    console.log("Navigate left")
    if (!this.selectedCell){
      return;
    }
    let c = $(this.selectedCell).prev();
    if (c && c[0]){
      this.selectCell(c[0]);
    }
  }

  protected navigateDown(){
    console.log("Navigate down")
    if (!this.selectedCell){
      return;
    }
    let c = $(this.selectedCell).closest('tr').next().find('td:eq(' + $(this.selectedCell).index() + ')');
    if (c && c[0]){
      this.selectCell(c[0]);
    }
  }

  protected navigateUp(){
    console.log("Navigate up")
    if (!this.selectedCell){
      return;
    }
    let c = $(this.selectedCell).closest('tr').prev().find('td:eq(' + $(this.selectedCell).index() + ')');
    if (c && c[0]){
      this.selectCell(c[0]);
    }
  }

  protected removeCurrentSelection(){
    if (this.selectedCell){
      //remove current selection
      this.selectedCell.classList.remove("selected")
    }
  }

  protected selectCell(cell:HTMLElement){
    this.removeCurrentSelection();
    cell.classList.add("selected")
    this.selectedCell = cell;

    let row = this.getSelectedRow();
    if (row>-1){
      this.selectRow(row)
    }
  }

  protected selectRow(row){
    if (this.selectedRow){
      this.selectedRow.classList.remove("selected")
    }
    let elements = $(this.tableElement).find("[trow="+row+"]")
    if (elements && elements.length==1){
      let rowEl:HTMLElement = elements[0]
      console.log("Row element: ", rowEl)
      rowEl.classList.add("selected")
      this.selectedRow = rowEl;
    }
  }

  public getSelectedRow():number{
    if (this.selectedCell){
        let row = this.selectedCell.getAttribute('row')
        return parseInt(row)
    } else {
      return -1;
    }
  }

  public getSelectedColumn():number{
    if (this.selectedCell){
        let col = this.selectedCell.getAttribute('col')
        return parseInt(col)
    } else {
      return -1;
    }
  }

  protected manageCellEdit(cell:HTMLElement){
    let row = this.getSelectedRow()
    let col = this.getSelectedColumn()
    if (this.extendedModel.isCellEditable(row, col)){
      this.startEditing(row, col, cell)
    }
  }

  protected startEditing(row:number, col:number,cell:HTMLElement){
    this.prepareEditor(row,col, cell)
    this.editorEl.style.visibility = "visible"
    this.editorEl.focus()
    this.editing = true
    $(this.editorEl).focusout(()=>{
      this.commitEditing();
    })
  }

  protected prepareEditor(row:number, col:number,cell:HTMLElement){
      this.moveEditor(cell);
      this.editorEl['getModel']().setText(cell.innerText);
      this.editorEl['getModel']().selectAll();
      return this.editorEl;
  }

  protected moveEditor(cell:HTMLElement){
    let width = cell.offsetWidth-2;
    let height = cell.offsetHeight-2;
    this.editorEl.style.width = width + "px"
    this.editorEl.style.height = height +"px"

    let offset = $(cell).offset()
    offset.top += 1
    offset.left += 1
    $(this.editorEl).offset(offset)


    $(this.validationErrorOverlay).offset({
      top: (offset.top-19),
      left: (offset.left-2)
    });
    this.validationErrorOverlay.style.width = (width-40) + "px"
  }

  protected commitEditing():boolean{
    console.log('commit!')

    let value = this.editorEl["getModel"]().getText();
    let row = this.getSelectedRow()
    let col = this.getSelectedColumn()
    let validationResult = this.extendedModel.onEditValidation(row, col, value);
    if (!validationResult.validationStatus){
      if (validationResult.showValidationError){
        //display overlay with error
        this.showValidationError(validationResult.validationErrorMessage)
      }
      return false;
    }

    this.editorEl.style.visibility = "hidden"
    $(this.editorEl).off('focusout')
    this.editing = false

    this.extendedModel.onValueChanged(row,col,value);
    this.tableElement.focus()

    return true;
  }

  protected cancelEditing(){
    console.log('cancel!')
    this.hideValidationError();
    this.editorEl.style.visibility = "hidden"
    $(this.editorEl).off('focusout')
    this.editing = false
    this.tableElement.focus()
  }

  public isEditing():boolean {
    return this.editing
  }

  protected showValidationError(errorMessage:string){
    this.validationErrorOverlay.innerText = errorMessage
    this.validationErrorOverlay.style.visibility = "visible"
    this.selectedCell.classList.add("validation-error")
  }

  protected hideValidationError(){
    this.validationErrorOverlay.style.visibility = "hidden"
    this.selectedCell.classList.remove("validation-error")
  }
}
