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
import { EventEmitter }  from 'events'

const crypto = require('crypto');
const events = require('events');
const _ = require('lodash')

export class UITabbedViewItem {
  public id:string;
  private title:string;
  public titleClassName:string = '';
  public view:HTMLElement;
  public readonly elementUID:string;
  private events:EventEmitter;
  constructor(id:string,title:string,view:HTMLElement){
    this.events = new EventEmitter();
    this.id = id;
    this.title = title;
    this.view = view;
    this.elementUID = crypto.createHash('md5').update(title).digest("hex");
  }
  setTitleClass(className:string):UITabbedViewItem{
    this.titleClassName = className;
    return this;
  }
  public setTitle(title:string):UITabbedViewItem{
    this.title = title;
    this.fireTitleChanged();
    return this;
  }
  public getTitle():string{
    return this.title;
  }
  protected fireTitleChanged(){
    this.events.emit('didTitleChanged', this)
  }
  public addEventListener(event:string,listener){
    this.events.addListener(event, listener)
  }
  public removeEventListener(event:string,listener){
    this.events.removeListener(event, listener)
  }
  public destroy(){
    this.events.removeAllListeners();
    this.view.remove()
    this.view = null;
    this.events = null;
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
  private selectedTab:UITabbedViewItem;

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
    this.stacked = new UITabbedViewStackedComponent('stack-view-container');

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
      this.selectedTab = tabItem;
      this.stacked.selectView(tabItem);
    });

  }

  public getSelectedTab():UITabbedViewItem{
      return this.selectedTab;
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
    // if is the first tab then select it
    if (this.views.length===1){
      this.selectedTab = tabItem;
    }
  }

  public removeViewByTitle(tabTitle:string){
    let tabItem = this.getTabItemByTitle(tabTitle);
    if (tabItem){
      this.removeView(tabItem);
    }
  }

  public removeViewById(tabId:string){
    let tabItem = this.getTabItemById(tabId);
    if (tabItem){
      this.removeView(tabItem);
    }
  }

  public getTabItemByTitle(tabTitle:string):UITabbedViewItem{
    return _.find(this.views, function(tabItem){
      return tabItem.getTitle()===tabTitle;
    })
  }

  public getTabItemById(tabId:string):UITabbedViewItem{
    return _.find(this.views, function(tabItem){
      return tabItem.id===tabId;
    })
  }

  public removeView(tabItem:UITabbedViewItem){
    this.tabList.removeTab(tabItem)
    this.stacked.removeView(tabItem)
    _.remove(this.views, function(item){
      return item.id===tabItem.id;
    })
    tabItem.destroy();
  }

  public removeAllTabs(){
    let allTabsIds = this.getAllIds();
    for (var i=0;i<allTabsIds.length;i++){
      this.removeViewById(allTabsIds[i])
    }
  }

  public getAllIds():Array<string>{
      let ret = [];
      for (var i=0;i<this.views.length;i++){
        ret.push(this.views[i].id)
      }
      return ret;
  }

  public setBottomToolbar(toolbarElement:HTMLElement){
    this.tabList.addBottomToolbar(toolbarElement);
    return this;
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
  private tabCaptionsMap:any = {};
  private eventEmitter = new events.EventEmitter();
  private currentTabTypeClassName: string = UITabbedView.CLSNAME_TAB_TYPE_DEFAULT;
  private bottomToolbarElement:HTMLElement;
  private bottomToolbarContainer:HTMLElement;

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

  public addBottomToolbar(toolbarEl:HTMLElement):UITabbedViewTabListComponent {
    this.bottomToolbarElement = toolbarEl;
    this.bottomToolbarContainer = createElement('div',{
      elements:[this.bottomToolbarElement],
      className: 'de-workbench-tabbedview-tablist-bottomtoolbar-container'
    })
    insertElement(this.mainElement,this.bottomToolbarContainer);
    return this;
  }

  /**
   * Add a new tab item
   **/
  public addTab(tabItem:UITabbedViewItem){
    let elementId = this.getItemIdForMaps(tabItem);
    let aElement:HTMLElement = createElement('a',{
      elements: [
        createText(tabItem.getTitle())
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

    this.tabCaptionsMap[elementId] = aElement;
    this.itemsElementsMap[elementId] = liElement;
    this.tabItemsMap[elementId] = tabItem;

    insertElement(this.olElement, liElement);

    if (this.selectedElement==undefined){
      this.selectedElement = liElement;
      this.selectedElement.classList.toggle('selected');
    }

    tabItem.addEventListener('didTitleChanged',(tabItem)=>{
      let el:HTMLElement = this.tabCaptionsMap[this.getItemIdForMaps(tabItem)];
      if (el){
        el.innerText = tabItem.getTitle();
      }
    })
  }

  protected getItemIdForMaps(tabItem:UITabbedViewItem):string {
    return "tabitem_" + tabItem.elementUID;
  }

  /**
   * Remmove a tab
   */
  public removeTab(tabItem:UITabbedViewItem){
    let elementId = this.getItemIdForMaps(tabItem);
    let aElement = this.tabCaptionsMap[elementId]
    let liElement = this.itemsElementsMap[elementId]
    if (liElement){
      this.olElement.removeChild(liElement)
    }
    delete this.tabCaptionsMap[elementId];
    delete this.itemsElementsMap[elementId];
    delete this.tabItemsMap[elementId];
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
    this.olElement.remove()
    delete this.itemsElementsMap;
    delete this.tabItemsMap;
    delete this.tabCaptionsMap;
    this.eventEmitter.removeAllListeners();
    super.destroy();
    this.eventEmitter = undefined;
  }

}


/**
 * Stacked views inner component
 */
class UITabbedViewStackedComponent extends UIBaseComponent {

  private selectedView: HTMLElement;
  private className:string = ""
  constructor(className?:string){
    super();
    this.className = className;
    this.buildUI();
  }

  private buildUI(){
    this.mainElement =  createElement('div', {
        className:'de-workbench-tabbedview-stacked-container ' + this.className
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
    // set the attribute to find it when necessary
    tabItem.view.setAttribute('tabitem-id', tabItem.id)
    tabItem.view.setAttribute('tabitem-uid', tabItem.elementUID)
    insertElement(this.mainElement, tabItem.view);
    if (this.selectedView==undefined){
      this.selectedView = tabItem.view;
      this.selectedView.style.display = "initial";
    } else {
        tabItem.view.style.display = "none";
    }
  }

  public removeView(tabItem:UITabbedViewItem){
    if (!tabItem.view){
      return;
    }
    let viewEl = this.getViewElement(tabItem);
    if (viewEl){
      this.mainElement.removeChild(viewEl)
    }
  }

  protected getViewElement(tabItem:UITabbedViewItem):Element {
      let nodeList = document.querySelectorAll('[tabitem-uid="'+ tabItem.elementUID +'"]')
      if (nodeList && nodeList.length===1){
        return nodeList[0];
      }
      return null;
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
