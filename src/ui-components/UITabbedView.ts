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

export class UITabbedView extends UIBaseComponent implements UIComponent {

  protected tabList:HTMLElement;
  protected stackContainer:HTMLElement;

  constructor(){
    super()
    this.buildUI();
  }

  protected buildUI(){
    let tabbedViewClass = "de-workbench-tabbedview";

    this.tabList = this.createTabList();
    this.stackContainer = this.createStackContainer();

    this.mainElement =  createElement('div', {
        elements: [
          this.tabList,
          this.stackContainer
              ],
        className:tabbedViewClass
    })
    this.mainElement.id = this.uiComponentId;

  }

  protected createTabList():HTMLElement {
    let tabListEl =  createElement('div', {
        elements: [
          createText('Tab List Container')
              ],
        className:'de-workbench-tabbedview-tablist'
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

}
