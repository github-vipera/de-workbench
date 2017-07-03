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
import { UITabbedView, UITabbedViewElementInfo } from '../../ui-components/UITabbedView'

const crypto = require('crypto');

export class ProjectSettingsView {

  private element: HTMLElement
  private item: any;
  private projectRoot: string;
  private projectId: string;
  private tabbedView: UITabbedView;

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

    // Create the main UI
    this.element = document.createElement('de-workbench-project-settings')

    this.tabbedView = new UITabbedView();
    this.tabbedView.addView(new UITabbedViewElementInfo('Platforms', null));
    this.tabbedView.addView(new UITabbedViewElementInfo('Installed Plugins', null));
    this.tabbedView.addView(new UITabbedViewElementInfo('Install New Plugins', null));
    this.tabbedView.addView(new UITabbedViewElementInfo('Variants', null));
    this.tabbedView.addView(new UITabbedViewElementInfo('App Signature', null));

    let el = createElement('div', {
        elements: [
          this.tabbedView.element()
        ],
        className: 'de-workbench-project-settings-view'
    });
    insertElement(this.element, el)
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
