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
import { UIListView, UIListViewModel } from '../../ui-components/UIListView'
import { Logger } from '../../logger/Logger'
import { UITabbedView, UITabbedViewItem } from '../../ui-components/UITabbedView'
import { InstalledPluginsView } from './InstalledPluginsView'

const crypto = require('crypto');

export class ProjectSettingsView {

  private element: HTMLElement
  private item: any;
  private projectRoot: string;
  private projectId: string;
  private tabbedView: UITabbedView;
  private installedPluginsView: InstalledPluginsView;

  constructor(projectRoot:string){
    this.projectRoot = projectRoot;
    this.projectId = crypto.createHash('md5').update(projectRoot).digest("hex");

    Logger.getInstance().debug("ProjectSettingsView creating for ",this.projectRoot, this.projectId);

    // Isnitialize the UI
    this.initUI();

    this.reloadProjectSettings();
  }

  private reloadProjectSettings(){
    ProjectManager.getInstance().cordova.getInstalledPlugins(this.projectRoot).then( (plugins:Array<CordovaPlugin>) => {
      Logger.getInstance().debug("ProjectSettingsView installed plugins ",this.projectRoot, plugins);
        //console.log("Plugins installed: ", plugins);
    });
  }

  private initUI(){
    Logger.getInstance().debug("ProjectSettingsView initUI called.");

    // create the single views
    this.installedPluginsView = new InstalledPluginsView();

    // Create the main UI
    this.element = document.createElement('de-workbench-project-settings')

    this.tabbedView = new UITabbedView();
    this.tabbedView.addView(new UITabbedViewItem('platforms',         'Platforms',            this.createSimpleEmptyView('blue')).setTitleClass('icon icon-settings'));
    this.tabbedView.addView(new UITabbedViewItem('installed_plugins', 'Installed Plugins',    this.installedPluginsView.element()).setTitleClass('icon icon-beaker'));
    this.tabbedView.addView(new UITabbedViewItem('install_plugins',   'Install New Plugins',  this.createSimpleEmptyView('green')).setTitleClass('icon icon-broadcast'));
    this.tabbedView.addView(new UITabbedViewItem('variants',          'Variants',             this.createSimpleEmptyView('yellow')).setTitleClass('icon icon-code'));
    this.tabbedView.addView(new UITabbedViewItem('app_signature',     'App Signature',        this.createSimpleEmptyView('brown')).setTitleClass('icon icon-circuit-board'));

    let el = createElement('div', {
        elements: [
          this.tabbedView.element()
        ],
        className: 'de-workbench-project-settings-view'
    });
    insertElement(this.element, el)
  }

  createSimpleEmptyView(color:string):HTMLElement {
      let el = createElement('div',{
        elements : [
          createText(color)
        ]
      });
      el.style["background-color"] = color;
      el.style["width"] = "100%";
      el.style["heightz"] = "100%";
      return el;
  }

  /**
   * Open this view
   */
  open () {
    Logger.getInstance().debug("ProjectSettingsView open called for ",this.projectRoot, this.projectId);
    if (this.item){
      atom.workspace["toggle"](this.item);
    } else {
      const  prefix = "dewb";
      const uri = prefix + '//' + '_prjsettings_' + this.projectId;
      this.item = {
        activatePane: true,
        searchAllPanes: true,
        location: 'center',
        element: this.element,
        getTitle: () => 'DE Project Settings',
        getURI: () => uri
      };
      let atomWorkspace:any = atom.workspace;
      atomWorkspace["open"](this.item).then((view)=>{
      });
    }
  }

}
