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

import { UIComponent, UIBaseComponent } from '../ui-components/UIComponent'
const $ = require('jquery')

export interface UICollapsiblePaneItem {
    id:string;
    view:HTMLElement;
    caption:string;
    subtle?:string;
    collapsed?:boolean;
}

export class UICollapsiblePane extends UIBaseComponent {

  protected listTreeEl:HTMLElement;
  private items:Array<CollapsiblePaneElement>;

  constructor(){
    super();
    this.initUI();
  }

  protected initUI(){
    this.items = [];

    this.listTreeEl = createElement('ul',{
      className: 'list-tree has-collapsable-children'
    })

    this.mainElement = this.listTreeEl;

  }

  public addItem(item:UICollapsiblePaneItem):UICollapsiblePane {
    let newItem = new CollapsiblePaneElement(item);
    this.items.push(newItem);
    insertElement(this.listTreeEl, newItem.element())
    return this;
  }

}

class CollapsiblePaneElement extends UIBaseComponent {
  item:UICollapsiblePaneItem;
  captionEl:HTMLElement;
  subtleEl:HTMLElement;
  listItemEl:HTMLElement;
  ulViewContainerEl:HTMLElement;
  liItem:HTMLElement;

  constructor(item:UICollapsiblePaneItem){
    super();
    this.item = item;
    this.initUI();
  }

  protected initUI(){
    this.captionEl = createElement('span',{
      elements : [ createText(this.item.caption)],
      className : 'de-wb-collapsible-pane-item-caption-text'
    })

    let subtleText = '';
    if (this.item.subtle){
      subtleText = this.item.subtle;
    }
    this.subtleEl = createElement('span',{
      elements : [ createText(subtleText)],
      className : 'de-wb-collapsible-pane-item-caption-subtletext'
    })

    this.listItemEl = createElement('div',{
        elements: [this.captionEl, this.subtleEl],
        className : 'de-wb-collapsible-pane-item-caption list-item'
    })

    this.ulViewContainerEl = createElement('ul',{
      elements: [
          this.item.view
      ],
    })

    this.liItem = createElement('li',{
        elements: [
            this.listItemEl,
            this.ulViewContainerEl
        ],
        className: 'de-wb-collapsible-pane-item list-nested-item ' + (this.item.collapsed? 'collapsed' : '')
    })
    this.liItem.addEventListener('click',(evt)=>{
      this.liItem.classList.toggle('collapsed')
      this.item.collapsed = !this.item.collapsed;
    })


    this.mainElement = this.liItem;
  }

  public destroy(){
    super.destroy()
    $(this.listItemEl).off()
    this.liItem.remove();
  }

}
