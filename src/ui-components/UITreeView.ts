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

export interface UITreeItem {
  id:string;
  name:string;
  className?:string;
  htmlElement?:HTMLElement;
  children?:Array<UITreeItem>;
  selected?:boolean;
}

export interface UITreeViewModel {
  root:UITreeItem;
  className?:string;
}

export class UITreeView extends UIBaseComponent {

  private model:UITreeViewModel;
  private treeElement: HTMLElement;

  constructor(model?:UITreeViewModel){
    super();
    this.initUI();
    if (model){
      this.setModel(model);
    }
  }

  private initUI(){

    this.mainElement =  createElement('div', {
        elements: [
              ],
        className:'de-workbench-treeview'
    })

  }

  public setModel(model:UITreeViewModel){
    this.model = model;
    this.modelChanged()
  }

  public modelChanged(){
    let oldTree = this.treeElement;
    this.treeElement = this.rebuildTree();
    if (oldTree){
      this.mainElement.replaceChild(this.treeElement, oldTree);
    } else {
      insertElement(this.mainElement, this.treeElement)
    }
  }

  private rebuildTree():HTMLElement {

    let rootItemEl = this.buildTreeItem(this.model.root);

    /*
    let treeContainer = createElement('div',{
        className : 'de-woekbench-treeview-container'
    })
    */

    let ulMainTree = createElement('ul',{
        elements : [ rootItemEl ],
        className: 'list-tree has-collapsable-children'
    })

    //insertElement(treeContainer, this.ulMainTree)

    return ulMainTree;
  }

  private buildTreeItem(item:UITreeItem){

    // create item caption
    let treeItemCaption = createElement('span',{
      elements :  [ createText(item.name)]
    })
    let treeItemHeader = createElement('div',{
      elements: [ treeItemCaption ],
      className: 'header list-item'
    });
    treeItemHeader.setAttribute("treeitemId", item.id)
    if (item.selected){
        treeItemHeader.classList.add("selected")
    }

    treeItemHeader.addEventListener('click',(evt)=>{
      let itemId = evt.currentTarget.attributes["treeitemId"].value;
      this.toggleTreeItem(itemId);
    })

    // create children
    let childCount = 0;
    let treeItemChildren = createElement('ol',{
      className: 'de-workbench-treeview-chidlren-list entries list-tree'
    })
    if (item.children){
      childCount = item.children.length;
      for (var i=0;i<item.children.length;i++){
          let child = this.buildTreeItem(item.children[i])
          insertElement(treeItemChildren, child)
      }
    }

    let treeItem = createElement('li',{
      className : 'de-woekbench-treeview-treeitem entry list-nested-item collapsed',
      elements : [ treeItemHeader, treeItemChildren ]
    })
    treeItem.setAttribute("treeitemId", item.id)
    treeItem.setAttribute("id", this.buildItemElementId(item.id))
    return treeItem;
  }

  public buildItemElementId(id:string):string{
    return "de-woekbench-treeview-treeitem-li-" +  id;
  }

  public expandItemById(id:string){
    let el = this.getTreeItemById(id);
    el.classList.remove("collapsed");
  }

  public collapseItemById(id:string){
    let el = this.getTreeItemById(id);
    el.classList.add("collapsed");
  }

  public toggleTreeItem(id:string){
    let el = this.getTreeItemById(id);
    el.classList.toggle("collapsed");
  }

  public getTreeItemById(id:string){
    let itemElementId = this.buildItemElementId(id);
    return this.mainElement.querySelector("#"+itemElementId);
  }

  public destroy(){
    this.model = undefined;
    if (this.treeElement){
      this.treeElement.remove()
    }
    super.destroy();
  }
}
