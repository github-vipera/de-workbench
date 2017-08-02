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

const SelectListView = require('atom-select-list')

export interface UIMenuItem {
  displayName?:string,
  value:string,
  element?:HTMLElement
}

export class UIButtonMenu extends UIBaseComponent {

  private items:Array<UIMenuItem>;
  private listView:any;
  private panel:any;
  private infoMessage:string;
  private onSelectListener:Function;

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){
    this.mainElement = createElement('button',{
      elements: [
        createText("Button Menu")
      ],
      className: 'btn inline-block-tigh btn-primary de-workbench-button-menu'
    })
    this.mainElement.addEventListener('click',(evt)=>{
      this.showMenu();
    });

  }

  public setCaption(caption:string):UIButtonMenu{
    this.mainElement.innerText=caption;
    return this;
  }

  public setMenuItems(items:Array<UIMenuItem>):UIButtonMenu {
    this.items = items;
    return this;
  }

  public showMenu(){
    this.listView = new SelectListView({
      items: this.items,
      infoMessage: this.infoMessage,
      elementForItem: this.createMenuElement,
      filterKeyForItem: (item) => item.displayName,
      didConfirmSelection: (item) => {
        console.log("Selected menu item ", item)
        this.dismissMenu()
        setTimeout(()=>{
            this.onItemSelected(item)
          },50
        )
      },
      didCancelSelection: () => {
        this.dismissMenu()
      }
    });
    this.panel = atom.workspace.addModalPanel({
      item: this.listView
    });
    this.listView.focus();
    this.panel.show()
  }

  onItemSelected(item:UIMenuItem){
    if (this.onSelectListener){
      this.onSelectListener(item)
    }
  }

  async dismissMenu(){
    await this.panel.destroy();
    await this.listView.destroy();
  }

  createMenuElement(item:UIMenuItem):HTMLElement {
    var content:any = null;
    if (item.element){
        content = item.element
    }
    else if (item.displayName){
      content = createText(item.displayName);
    } else {
        content = createText(item.value);
    }
    var el = createElement('li', { elements: [content] })
    el.setAttribute('menu-item-value', item.value)
    el.classList.add('de-workbench-menu-item')
    return el;
  }

  public setInfoMessage(message:string):UIButtonMenu{
    this.infoMessage = message;
    return this;
  }

  public setOnSelectionListener(listener:Function):UIButtonMenu{
    this.onSelectListener = listener;
    return this;
  }


}
