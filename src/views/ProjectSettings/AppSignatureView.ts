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
} from '../../element/index';

import { EventEmitter }  from 'events'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { Logger } from '../../logger/Logger'
import { UIPluginsList } from '../../ui-components/UIPluginsList'
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'

export class AppSignatureView extends UIBaseComponent {

  private tabbedView: UITabbedView;
  private stackedPage: UIStackedView;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){

    this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);

    this.tabbedView.addView(new UITabbedViewItem('ios',       'iOS',  this.createSimpleEmptyView('iOS App Signing here')).setTitleClass('icon icon-settings'));
    this.tabbedView.addView(new UITabbedViewItem('android',   'Android',  this.createSimpleEmptyView('Android App Signing here')).setTitleClass('icon icon-settings'));

    this.stackedPage = new UIStackedView()
                        .setTitle('App Signature')
                        .setInnerView(this.tabbedView.element())
                        .addHeaderClassName('de-workbench-stacked-view-header-section-thin');

    this.mainElement = this.stackedPage.element();
  }


  createSimpleEmptyView(color:string):HTMLElement {
      let el = createElement('div',{
        elements : [
          createText(color)
        ]
      });
      el.style["background-color"] = 'transparent';
      el.style["width"] = "100%";
      el.style["heightz"] = "100%";
      return el;
  }

}
