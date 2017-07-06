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
import { CommunityPluginsView } from './CommunityPluginsView'
export class InstallNewPluginsView extends UIBaseComponent {

  private pluginList: UIPluginsList;
  private stackedPage: UIStackedView;
  private tabbedView: UITabbedView;
  private communityPluginsView: CommunityPluginsView;

  constructor(){
    super();
    this.buildUI();

    let currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
    let cordova:Cordova = ProjectManager.getInstance().cordova;

    cordova.getInstalledPlugins(currentProjectRoot).then((installedPlugins:Array<CordovaPlugin>)=>{
      this.pluginList.addPlugins(installedPlugins);
    });

  }

  private buildUI(){
    this.communityPluginsView = new CommunityPluginsView();

    this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);

    this.tabbedView.addView(new UITabbedViewItem('de_plugins',          'Dynamic Engine Plugins',  this.createSimpleEmptyView('Dynamic Engine Plugins List here')).setTitleClass('icon icon-settings'));
    this.tabbedView.addView(new UITabbedViewItem('community_plugins',   'Community Plugins',  this.communityPluginsView .element()).setTitleClass('icon icon-settings'));

    this.stackedPage = new UIStackedView()
                        .setTitle('Install New Plugins')
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
