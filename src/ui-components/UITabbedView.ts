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
const crypto = require('crypto');
import { EventEmitter }  from 'events'

export class UITabbedViewItem {
  public title:string;
  public titleClassName:string = '';
  public view:HTMLElement;
  public readonly elementId:string;
  constructor(title:string,view:HTMLElement){
    this.title = title;
    this.view = view;
    this.elementId = crypto.createHash('md5').update(title).digest("hex");
  }
  setTitleClass(className:string):UITabbedViewItem{
    this.titleClassName = className;
    return this;
  }
}


/**
 * Tabbed View main component
 */
export class UITabbedView extends UIBaseComponent implements UIComponent {

  private tabList:UITabbedViewTabListComponent;
  protected stackContainer:HTMLElement;
  private views:Array<UITabbedViewItem>;

  constructor(){
    super()
    this.buildUI();
  }

  protected buildUI(){
    let tabbedViewClass = "de-workbench-tabbedview";

    this.views = new Array();
    this.tabList = new UITabbedViewTabListComponent();
    this.stackContainer = this.createStackContainer();

    this.mainElement =  createElement('div', {
        elements: [
          this.tabList.element(),
          this.stackContainer
              ],
        className:tabbedViewClass
    })
    this.mainElement.id = this.uiComponentId;

  }

  protected createTabList():HTMLElement {
    let listEl = createElement('ol',{
      className:'de-workbench-tabbedview-tablist-ol'
    });
    let tabListEl =  createElement('div', {
        elements: [
          listEl
        ],
        className:'de-workbench-tabbedview-tablist-container'
    })
    return tabListEl;
  }

  protected createStackContainer():HTMLElement {
    let stackViewContEl =  createElement('div', {
        elements: [
            createText('Stacked View Container')
              ],
        className:'de-workbench-tabbedview-stackview'
    })
    return stackViewContEl;
  }

  public addView(tabItem:UITabbedViewItem){
    this.views.push(tabItem);
    this.tabList.addTab(tabItem); //tabInfo.tabbedElement.title, tabinfo.tabbedElement.titleClassName, tabInfo.elementId);
  }

  public removeView(tabItem:UITabbedViewItem){
    //TODO!!
  }

}


/**
 * List inner component
 */
class UITabbedViewTabListComponent {

  private mainElement: HTMLElement;
  private olElement: HTMLElement;
  private selectedElement: HTMLElement;
  private itemsMap:any = {};

  constructor(){
    this.buildUI();
  }

  private buildUI(){
    this.olElement = createElement('ol',{
      className:'de-workbench-tabbedview-tablist-ol'
    });
    this.mainElement =  createElement('div', {
        elements: [
          this.olElement
        ],
        className:'de-workbench-tabbedview-tablist-container'
    })
  }

  public element(): HTMLElement {
    return this.mainElement;
  }

  public addTab(tabItem:UITabbedViewItem){
    let elementId = "tabitem_" + tabItem.elementId;
    let aElement:HTMLElement = createElement('a',{
      elements: [
        createText(tabItem.title)
      ],
      className: tabItem.titleClassName
    });
    aElement.id = elementId;

    let liElement:HTMLElement = createElement('li',{
      elements : [
        aElement
      ],
      className: "de-workbench-tabbedview-tab-item"
    });
    liElement.id = elementId;

    liElement.addEventListener('click', (evt)=>{
      evt.preventDefault();
      let selectedID = evt.srcElement.id.substring("tabitem_".length);

      if (this.selectedElement && (this.selectedElement.id==evt.srcElement.id)){
        //already selected
        return;
      } else if (this.selectedElement && (this.selectedElement.id!=evt.srcElement.id)){
        //remove selection
        this.selectedElement.classList.toggle('selected');
      }
      this.selectedElement = this.itemsMap[evt.srcElement.id];
      this.selectedElement.classList.toggle('selected');

      // TODO!! generate event
      console.log("Clicked element li:",this.selectedElement);
    });

    this.itemsMap[elementId] = liElement;

    insertElement(this.olElement, liElement);

    if (this.selectedElement==undefined){
      this.selectedElement = liElement;
      this.selectedElement.classList.toggle('selected');
    }
  }


  public removeTab(id:string){
    // TODO!!
  }

  public addEventListener(listener){

  }

}
