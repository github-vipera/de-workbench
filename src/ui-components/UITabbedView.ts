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

export enum UITabbedViewTabType {
  Vertical,
  Horizontal
}

/**
 * Tabbed View main component
 */
export class UITabbedView extends UIBaseComponent {

  private tabList:UITabbedViewTabListComponent;
  private stacked:UITabbedViewStackedComponent;
  private views:Array<UITabbedViewItem>;
  private tabType:UITabbedViewTabType;

  public static readonly CLSNAME_TAB_TYPE_VERTICAL:string = "tab-type-vertical";
  public static readonly CLSNAME_TAB_TYPE_HORIZONTAL:string = "tab-type-horizontal";
  public static readonly CLSNAME_TAB_TYPE_DEFAULT:string = UITabbedView.CLSNAME_TAB_TYPE_VERTICAL;

  constructor(){
    super()
    this.buildUI();
  }

  protected buildUI(){
    let tabbedViewClass = "de-workbench-tabbedview";

    // create the tab view items list
    this.views = new Array();

    // the component that manages the tab list
    this.tabList = new UITabbedViewTabListComponent();

    // the component that manages the stacked views
    this.stacked = new UITabbedViewStackedComponent();

    this.mainElement =  createElement('div', {
        elements: [
          this.tabList.element(),
          this.stacked.element()
              ],
        className:tabbedViewClass
    })
    this.mainElement.id = this.uiComponentId;

    //by default
    this.setTabType(UITabbedViewTabType.Vertical);

    // listen fo events
    this.tabList.addEventListener(UITabbedViewTabListComponent.EVT_TABITEM_SELECTED, (tabItem:UITabbedViewItem, htmlElement:HTMLElement)=>{
      this.stacked.selectView(tabItem);
    });

  }

  public setTabType(tabType:UITabbedViewTabType):UITabbedView{
    let needRedraw = (this.tabType!=tabType);
    if (!needRedraw){
      return this;
    }
    this.tabType = tabType;

    let tabTypeClassToRemove = '';
    let tabTypeClassName = '';
    if (tabType===UITabbedViewTabType.Horizontal){
      tabTypeClassName = UITabbedView.CLSNAME_TAB_TYPE_HORIZONTAL;
      tabTypeClassToRemove = UITabbedView.CLSNAME_TAB_TYPE_VERTICAL;
    } else {
      tabTypeClassName = UITabbedView.CLSNAME_TAB_TYPE_VERTICAL;
      tabTypeClassToRemove = UITabbedView.CLSNAME_TAB_TYPE_HORIZONTAL;
    }
    this.mainElement.classList.remove(tabTypeClassToRemove);
    this.mainElement.classList.add(tabTypeClassName);

    this.tabList.toggleTabTypeClass(tabTypeClassToRemove, tabTypeClassName);
    this.stacked.toggleTabTypeClass(tabTypeClassToRemove, tabTypeClassName);


    return this;
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
    this.tabList.addTab(tabItem);
    this.stacked.addView(tabItem);
  }

  public removeView(tabItem:UITabbedViewItem){
    //TODO!!
  }

  public destroy(){
    this.tabList.destroy()
    this.stacked.destroy();
    super.destroy();
  }

}


/**
 * List inner component
 */
class UITabbedViewTabListComponent extends UIBaseComponent {

  public static readonly EVT_TABITEM_SELECTED:string = "UITabbedViewTabListComponent.tabItemSelected";

  private olElement: HTMLElement;
  private selectedElement: HTMLElement;
  private itemsElementsMap:any = {};
  private tabItemsMap:any = {};
  private eventEmitter = new events.EventEmitter();
  private currentTabTypeClassName: string = UITabbedView.CLSNAME_TAB_TYPE_DEFAULT;

  constructor(){
    super();
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

  /**
   * Add a new tab item
   **/
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
      className: "de-workbench-tabbedview-tab-item " + this.currentTabTypeClassName
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

  /**
   * Remmove a tab
   */
  public removeTab(tabItem:UITabbedViewItem){
    // TODO!!
  }

  /**
   * Select the given tab
   */
  public selectTab(tabItem:UITabbedViewItem){
    // TODO!!
  }

  /**
   * Change selected item and generate the event for listeners
   */
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

  public toggleTabTypeClass(classToRemove:string,classToAdd:string){
    this.currentTabTypeClassName = classToAdd;
    this.olElement.classList.remove(classToRemove);
    this.olElement.classList.add(classToAdd);
    this.mainElement.classList.remove(classToRemove);
    this.mainElement.classList.add(classToAdd);

    //    this.itemsElementsMap[elementId] = liElement;
    for (var key in this.itemsElementsMap) {
        this.itemsElementsMap[key].classList.remove(classToRemove);
        this.itemsElementsMap[key].classList.add(classToAdd);
    }
  }

  public destroy(){
      super.destroy();
  }

}


/**
 * Stacked views inner component
 */
class UITabbedViewStackedComponent extends UIBaseComponent {

  private selectedView: HTMLElement;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
    this.mainElement =  createElement('div', {
        className:'de-workbench-tabbedview-stacked-container'
    })
    this.mainElement.style["display"] = "flex";
  }

  public element(): HTMLElement {
    return this.mainElement;
  }

  public addView(tabItem:UITabbedViewItem){
    if (!tabItem.view){
      return;
    }
    insertElement(this.mainElement, tabItem.view);
    if (this.selectedView==undefined){
      this.selectedView = tabItem.view;
      this.selectedView.style.display = "initial";
    } else {
        tabItem.view.style.display = "none";
    }
  }

  public selectView(tabItem:UITabbedViewItem){
    if (!tabItem.view){
      return;
    }
    if (this.selectedView!=undefined){
      this.selectedView.style.display = "none";
    }
    this.selectedView = tabItem.view;
    this.selectedView.style.display = "initial";
  }

  public toggleTabTypeClass(classToRemove:string,classToAdd:string){
    this.mainElement.classList.remove(classToRemove);
    this.mainElement.classList.add(classToAdd);
  }


  public destroy(){
    super.destroy()
  }

}
