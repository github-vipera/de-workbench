'use babel'
import {
  createText,
  createElement,
  insertElement,
  createGroupButtons,
  createButton,
  createIcon,
  createIconFromPath,
  attachEventFromObject,
  createTextEditor,
  createSelect,
  createOption
} from '../element/index';

import { UIComponent, UIBaseComponent, UIExtComponent } from '../ui-components/UIComponent'
import { Logger } from '../logger/Logger'

const $ = require('jquery')

export interface UIEditableLabelOptions {
    caption?:string;
    className?:string;
    editable?:boolean;
}

export class UIEditableLabel extends UIExtComponent {

  _options:UIEditableLabelOptions;
  _labelContainer:HTMLElement;
  _labelEl:HTMLElement;
  _editable:boolean=true;
  _editorEl:HTMLElement;
  _isEditing:boolean;

  constructor(options?:UIEditableLabelOptions){
    super();
    if (options){
      this._options = options;
    }
    if (this._options && (typeof this._options.editable !== 'undefined')){
      this._editable = this._options.editable;
    }
    this.initUI();
  }

  protected initUI(){
    this._editorEl = this.createEditor();

    let caption = '';
    if (this._options && this._options.caption){
      caption = this._options.caption
    }

    let className = 'de-workbench-ui-editable-label'
    // CSS Class
    if (this._options && this._options.className){
       className =  className + ' ' + this._options.className
    }
    this._labelEl = createElement('a',{
      elements: [createText(caption)],
      className: className
    })


    // Events
    this._labelEl.addEventListener('dblclick',(evt)=>{
      this.onLabelDoubleClick(evt);
    })

    this._labelContainer = createElement('div',{
      elements: [this._labelEl, this._editorEl]
    })

    this.mainElement = this._labelContainer;
  }

  public setCaption(caption:string):UIEditableLabel {
      this._labelEl.innerText = caption
      return this;
  }

  protected onLabelDoubleClick(evt){
    if (this._editable){
      this.startEditing(this._labelEl);
    }
  }

  public startEdit(){
    if (this._editable){
      this.startEditing(this._labelEl);
    }
  }

  protected createEditor():HTMLElement{
    //let editorEl = createTextEditor({});
    let editorEl = createElement('input',{})
    editorEl.style.background = "transparent"
    editorEl.style.position = "absolute"
    editorEl.style.visibility = "hidden"
    editorEl.classList.add("de-workbench-editable-label-editor");
    editorEl.classList.add("native-key-bindings")
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

  protected commitEditing():boolean{
    Logger.consoleLog('commit!')
    let value = this._editorEl["value"];
    this.setCaption(value)
    this._labelEl.style.visibility = "visible"
    this._editorEl.style.visibility = "hidden"
    $(this._editorEl).off('focusout')
    $(this._editorEl).off('keydown')
    this._isEditing = false
    this.fireEvent('didValueChange', this)
    return true;
  }

  protected cancelEditing(){
    Logger.consoleLog('cancel!')
    this._labelEl.style.visibility = "visible"
    this._editorEl.style.visibility = "hidden"
    $(this._editorEl).off('focusout')
    $(this._editorEl).off('keydown')
    this._isEditing = false
  }

  protected startEditing(cell:HTMLElement){
    this.prepareEditor(cell)
    this._editorEl.style.visibility = "visible"
    this._labelEl.style.visibility = "hidden"
    this._editorEl.focus()
    this._isEditing = true
    $(this._editorEl).focusout(()=>{
      this.commitEditing();
    })
  }

  protected prepareEditor(cell:HTMLElement){
      this.moveEditor(cell);

      let fontSizeCSS = window.getComputedStyle(this._labelEl).getPropertyValue('font-size');
      this._editorEl.style.setProperty ("font-size", fontSizeCSS, "important");

      let fontCSS = window.getComputedStyle(this._labelEl).getPropertyValue('font');
      this._editorEl.style.setProperty ("font", fontCSS, "important");

      this._editorEl["value"] = cell.innerText;
      this._editorEl["setSelectionRange"](0, cell.innerText.length)

          $(this._editorEl).keydown(function(e) {

              this.style.width = 0;
              var newWidth = this.scrollWidth + 10;

              if( this.scrollWidth >= this.clientWidth )
                  newWidth += 10;

              this.style.width = newWidth + 'px';

          });
      return this._editorEl;
  }

  public isEditing():boolean {
    return this._isEditing;
  }

  protected moveEditor(cell:HTMLElement){
    let width = cell.offsetWidth;
    let height = cell.offsetHeight;
    this._editorEl.style.width = width + "px"
    this._editorEl.style.height = height +"px"

    let offset = $(cell).offset()
    offset.top += 0
    offset.left += 0
    $(this._editorEl).offset(offset)

  }

  public getCaption():string {
    return this._labelEl.innerText;
  }

}
