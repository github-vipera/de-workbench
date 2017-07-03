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

export class ProjectSettingsView {

  private element: HTMLElement
  private item: any;
  private projectRoot:string;

  constructor(projectRoot:string){
    this.projectRoot = projectRoot;
    this.initUI();
  }

  private initUI(){
    // Create the main UI
    this.element = document.createElement('de-workbench-project-settings')

    let el = createElement('div', {
        elements: [
              createText('Project Settings Here')
        ]
    });
    insertElement(this.element, el)
  }

  /**
   * Open this view
   */
  open () {
    if (this.item){
      atom.workspace["toggle"](this.item);
    } else {
      const  prefix = "dewb";
      const uri = prefix + '//' + '_prjsettings';
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
