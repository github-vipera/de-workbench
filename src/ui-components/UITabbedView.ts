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

export class UITabbedViewElementInfo {
  public title:string;
  public view:HTMLElement;
  constructor(title:string,view:HTMLElement){
    this.title = title;
    this.view = view;
  }
}

class UITabbedViewElement {

  public tabbedElement: UITabbedViewElementInfo;
  public elementId: string;

  constructor(tabbedElement:UITabbedViewElementInfo){
    this.tabbedElement = tabbedElement;
    this.elementId = crypto.createHash('md5').update(tabbedElement.title).digest("hex");
  }

  public tabElement():HTMLElement {
    return null;
  }

  public viewElement():HTMLElement {
    return this.tabbedElement.view;
  }

  public getElementId():string {
    return this.elementId;
  }

}


export class UITabbedView extends UIBaseComponent implements UIComponent {

  private tabList:UITabbedViewTabListComponent;
  protected stackContainer:HTMLElement;
  private views:Array<UITabbedViewElement>;

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

  public addView(tabbedView:UITabbedViewElementInfo){
    let tabInfo = new UITabbedViewElement(tabbedView);
    this.views.push(tabInfo);
    this.tabList.addTab(tabInfo.tabbedElement.title, tabInfo.elementId);
  }

  public removeView(tabbedView:UITabbedViewElementInfo){
    //TODO!!
  }

}

/**
 * List component
 */
class UITabbedViewTabListComponent {

  private mainElement: HTMLElement;
  private olElement: HTMLElement;

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

  public addTab(title:string,id:string){
    let aElement:HTMLElement = createElement('a',{
      elements: [
        createText(title)
      ]
      className: "icon icon-settings"
    });
    let liElement:HTMLElement = createElement('li',{
      elements : [
        aElement
      ],
      className: "de-workbench-tabbedview-tab-item"
    });
    liElement.id = "tabel_" + id;
    insertElement(this.olElement, liElement);
  }

  public removeTal(id:string){
    // TODO!!
  }

}
