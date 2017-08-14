'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
 import {
   createText,
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

export interface UIListViewModel {
    hasHeader():boolean;
    getRowCount():number;
    getColCount():number;
    getElementAt?(row:number, col:number):HTMLElement;
    getValueAt(row:number, col:number):any;
    getClassNameAt(row:number, col:number):string;
    getColumnName(col:number):string;
    getClassName():string;
    addEventListener(event:string, listener);
    removeEventListener(event:string, listener);
    destroy();
}

export class UIListView extends UIBaseComponent {

  protected model: UIListViewModel;
  protected tableElement: HTMLElement;

  constructor(model:UIListViewModel){
    super();
    if (model){
      this.setModel(model);
    }
  }

  public setModel(model:UIListViewModel){
    this.model = model;
    this.buildUI();
    this.model.addEventListener('didModelChanged', ()=>{
      this.modelChanged()
    })
  }

  protected buildUI(){
    let listViewClass = "de-workbench-listview";
    let customClass = this.model.getClassName();
    if (customClass){
      listViewClass += " " + customClass;
    }

    this.tableElement = this.createTableElement();

    this.mainElement =  createElement('div', {
        elements: [
          this.tableElement
              ],
        className:listViewClass
    })
    this.mainElement.id = this.uiComponentId;

    this.tableReady(this.tableElement)
  }

  protected tableReady(table:HTMLElement){
      //overridable
  }

  protected createTableElement():HTMLElement {
    let table = createElement('table',{
      className: "de-workbench-listview-tb"
    });

    // create header if required
    if (this.model.hasHeader()){
      let tbRow = createElement('tr', { className: 'de-workbench-listview-tb-header'});
      for (var c=0;c<this.model.getColCount();c++){
        let tbCol = createElement('th', {
          elements: [
            createText(this.model.getColumnName(c))
          ],
          className: "de-workbench-listview-tb-header-col"
        });
        insertElement(tbRow, tbCol);
      }
      insertElement(table, tbRow);
    }

    // create rows
    for (var r=0;r<this.model.getRowCount();r++){
      let tbRow = createElement('tr');
      for (var c=0;c<this.model.getColCount();c++){
        let innerElement = undefined;
        if (typeof this.model.getElementAt == "function"){
          innerElement = this.model.getElementAt(r,c);
        } else {
          innerElement = createText(this.model.getValueAt(r,c))
        }
        let tbCol = createElement('td', {
          elements: [
            innerElement
          ]
        });
        tbCol.setAttribute('row',r)
        tbCol.setAttribute('col',c)
        insertElement(tbRow, tbCol);
      }
      tbRow.setAttribute('trow', r)
      insertElement(table, tbRow);
    }

    return table;
  }

  protected modelChanged(){
    let oldTable = this.tableElement;
    this.tableElement = this.createTableElement();
    this.mainElement.replaceChild(this.tableElement, oldTable);
    this.tableReady(this.tableElement)
  }

  public destroy(){
    this.model.destroy()
    this.tableElement.remove();
    super.destroy()
  }


}
