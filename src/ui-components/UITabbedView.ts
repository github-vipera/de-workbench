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
const events = require('events');

export class UITabbedViewItem {
  public id:string;
  public title:string;
  public titleClassName:string = '';
  public view:HTMLElement;
  public readonly elementUID:string;
  constructor(id:string,title:string,view:HTMLElement){
    this.id = id;
    this.title = title;
    this.view = view;
    this.elementUID = crypto.createHash('md5').update(title).digest("hex");
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

    this.tabList.addEventListener(UITabbedViewTabListComponent.EVT_TABITEM_SELECTED, function(tabItem:UITabbedViewItem, htmlElement:HTMLElement){
      console.log("Cliccato!!! ", tabItem, htmlElement);
    });
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

  public static readonly EVT_TABITEM_SELECTED:string = "UITabbedViewTabListComponent.tabItemSelected";

  private mainElement: HTMLElement;
  private olElement: HTMLElement;
  private selectedElement: HTMLElement;
  private itemsElementsMap:any = {};
  private tabItemsMap:any = {};
  private eventEmitter = new events.EventEmitter();

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
    let elementId = "tabitem_" + tabItem.elementUID;
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
      this.onTabItemSelected(evt.srcElement);
    });

    this.itemsElementsMap[elementId] = liElement;
    this.tabItemsMap[elementId] = tabItem;

    insertElement(this.olElement, liElement);

    if (this.selectedElement==undefined){
      this.selectedElement = liElement;
      this.selectedElement.classList.toggle('selected');
    }
  }

  private onTabItemSelected(item:Element){
    let selectedID = item.id.substring("tabitem_".length);

    if (this.selectedElement && (this.selectedElement.id==item.id)){
      //already selected
      return;
    } else if (this.selectedElement && (this.selectedElement.id!=item.id)){
      //remove selection
      this.selectedElement.classList.toggle('selected');
    }
    this.selectedElement = this.itemsElementsMap[item.id];
    this.selectedElement.classList.toggle('selected');

    // generate event
    //console.log("Clicked element li:",this.selectedElement);
    this.eventEmitter.emit(UITabbedViewTabListComponent.EVT_TABITEM_SELECTED, this.tabItemsMap[item.id], this.itemsElementsMap[item.id]);
  }

  public addEventListener(event:string, listener:Function){
    this.eventEmitter.on(event, listener);
  }

  public removeTab(id:string){
    // TODO!!
  }


}
