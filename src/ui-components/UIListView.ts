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

export interface UIListViewModel {
    hasHeader():boolean;
    getRowCount():number;
    getColCount():number;
    getValueAt(row:number, col:number);
    getClassNameAt(row:number, col:number);
    getColumnName(col:number):string;
    getClassName():string;
}

export class UIListView {

  private mainElement: HTMLElement;
  private model: UIListViewModel;
  private tableElement: HTMLElement;
  private viewElementId: string;

  constructor(model:UIListViewModel){
    this.model = model;
    this.viewElementId = "12345";
    this.buildUI();
  }

  private buildUI(){
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
    this.mainElement.id = this.viewElementId;
  }

  protected createTableElement():HTMLElement {
    let table = createElement('table',{
      className: "de-workbench-listview-tb"
    });

    // create header if required
    if (this.model.hasHeader()){
      let tbRow = createElement('tr');
      for (var c=0;c<this.model.getColCount();c++){
        let tbCol = createElement('th', {
          elements: [
            createText(this.model.getColumnName(c))
          ]
        });
        insertElement(tbRow, tbCol);
      }
      insertElement(table, tbRow);
    }

    // create rows
    for (var r=0;r<this.model.getRowCount();r++){
      let tbRow = createElement('tr');
      for (var c=0;c<this.model.getColCount();c++){
        let tbCol = createElement('td', {
          elements: [
            createText(this.model.getValueAt(r,c))
          ]
        });
        insertElement(tbRow, tbCol);
      }
      insertElement(table, tbRow);
    }

    return table;
  }

  public element(){
    return this.mainElement;
  }


}
