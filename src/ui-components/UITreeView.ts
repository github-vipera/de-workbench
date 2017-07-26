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
import { forEach, remove } from 'lodash'
export interface UITreeItem {
  id:string;
  name:string;
  className?:string;
  icon?:string;
  expanded?:boolean;
  htmlElement?:HTMLElement;
  children?:Array<UITreeItem>;
  selected?:boolean;
}

export interface UITreeViewModel {
  root:UITreeItem;
  className?:string;
  getItemById?(id:string,model:UITreeViewModel):UITreeItem; // optional, if provided, listeners receive both id and item of selection
}

export interface UITreeViewSelectListener {
  onItemSelected(itemId:string,item?:UITreeItem):void
}

export class UITreeView extends UIBaseComponent {

  private model:UITreeViewModel;
  private treeElement: HTMLElement;
  private currentSelection: string;
  private listeners: Array<UITreeViewSelectListener> = [];

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

    let ulMainTree = createElement('ul',{
        elements : [ rootItemEl ],
        className: 'list-tree has-collapsable-children focusable-panel'
    })

    return ulMainTree;
  }

  private buildTreeItem(item:UITreeItem){

    let iconClass = "";
    if (item.icon){
      iconClass = "icon " + item.icon
    }
    // create item caption
    let treeItemCaption = createElement('span',{
      elements :  [ createText(item.name)],
      className: iconClass
    })

    let treeItemHeader = createElement('div',{
      elements: [ treeItemCaption ],
      className: 'header list-item'
    });
    treeItemHeader.setAttribute("treeitemId", item.id)
    treeItemHeader.setAttribute("id", "de-woekbench-treeview-treeitem-header-" + item.id)
    if (item.selected){
        treeItemHeader.classList.add("selected")
    }

    treeItemHeader.addEventListener('click',(evt)=>{
      this.onItemClicked(evt);
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

    let listClassName = 'list-item';
    if (childCount>0){
      listClassName = 'list-nested-item'
    }
    if (!item.expanded){
      listClassName += ' collapsed'
    }
    let treeItem = createElement('li',{
      className : 'de-woekbench-treeview-treeitem entry ' + listClassName ,
      elements : [ treeItemHeader, treeItemChildren ]
    })
    treeItem.setAttribute("treeitemId", item.id)
    treeItem.setAttribute("id", this.buildItemElementId(item.id))
    return treeItem;
  }

  addSelectListener(listener:UITreeViewSelectListener){
    this.listeners.push(listener);
  }
  removeSelectListener(listener:UITreeViewSelectListener){
    remove(this.listeners,function(single){
      return single == listener;
    });
  }

  protected onItemClicked(evt){
    // Expand/Collapse if necessary
    let itemId = evt.currentTarget.attributes["treeitemId"].value;
    this.toggleTreeItemExpansion(itemId);

    // Select the item
    if (this.currentSelection){
      // remove current selection
      this.selectItemById(this.currentSelection, false);
    }
    this.selectItemById(itemId, true);
    this.currentSelection = itemId;
    this.fireSelectionChange(this.currentSelection);
  }

  protected fireSelectionChange(itemId:string){
    forEach(this.listeners,(single:UITreeViewSelectListener) => {
      let item:UITreeItem=null;
      if(this.model.getItemById){
        item=this.model.getItemById(itemId,this.model);
      }
      single.onItemSelected(itemId,item);
    });
  }

  public getCurrentSelectedItemId():string{
    return this.currentSelection
  }

  public selectItemById(id:string,select:boolean){
    let el = this.mainElement.querySelector('#de-woekbench-treeview-treeitem-header-' + id)
    if (select){
      el.classList.add("selected");
    } else {
      el.classList.remove("selected");
    }
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

  public toggleTreeItemExpansion(id:string){
    let el = this.getTreeItemById(id);
    el.classList.toggle("collapsed");
  }

  public getTreeItemById(id:string){
    let itemElementId = this.buildItemElementId(id);
    return this.mainElement.querySelector("#"+itemElementId);
  }

  public destroy(){
    this.model = undefined;
    this.listeners = null;
    if (this.treeElement){
      this.treeElement.remove()
    }
    super.destroy();
  }
}


export function findItemInTreeModel(itemId:string,model:UITreeViewModel){
    function _findInTreeItem(item:UITreeItem){
      if(item.id == itemId){
        return item;
      }
      if(!item.children){
        return null;
      }
      for(let i=0;i < item.children.length; i ++){
        let found = _findInTreeItem(item.children[i]);
        if(found){
          return found;
        }
      }
    }

    return _findInTreeItem(model.root);
}
