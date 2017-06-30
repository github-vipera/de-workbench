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

import { EventEmitter }  from 'events'
import { CordovaUtils } from '../cordova/CordovaUtils'
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../cordova/Cordova'
import { ProjectTypePanel } from '../ui-components/ProjectTypePanel'

export class ProjectInspectorView {

  private element: HTMLElement
  private events: EventEmitter
  private panel: any
  private item: any;
  private atomWorkspace:any;
  private currentProjectPath: String;
  private cordova: Cordova;

  private installedPlatormsElement: HTMLElement;
  private projectIcon: HTMLElement;
  private projectTypePanel: ProjectTypePanel;

  constructor () {
    this.atomWorkspace = atom.workspace;
    this.events = new EventEmitter()

    // create Cordova utilities and tools
    this.cordova = new Cordova();

    this.initUI();

    this.projectTypePanel.setProjectType('');

    // Listen events
    ProjectManager.getInstance().didProjectChanged((projectPath)=>this.onProjectChanged(projectPath));
  }

  initUI() {
    // Create the UI
    this.element = document.createElement('de-workbench-project-inspector') //'de-workbench-projinspector-view'

    this.projectTypePanel = new ProjectTypePanel();
    insertElement(this.element, this.projectTypePanel.element())

    let el = createElement('de-workbench-group', {
        elements: [
          createElement('de-workbench-group-header', {
            elements: [createText('Installed Platforms')]
          }),
          createElement('de-workbench-group-header', {
            elements: [createText('Installed Plugins')]
          })
        ]
    });
    insertElement(this.element, el)
  }

  open () {

    if (this.item){
      this.atomWorkspace.toggle(this.item);
    } else {
      const  prefix = "dewb";
      const uri = prefix + '//' + '_prjinspector';
      this.item = {
        activatePane: true,
        searchAllPanes: true,
        location: 'right',
        element: this.element,
        getTitle: () => 'DE Project Inspector',
        getURI: () => uri,
        getDefaultLocation: () => 'right',
        getAllowedLocations: () => ['left', 'right']
      };
      this.atomWorkspace.open(this.item).then((view)=>{
      });
    }
  }

  close () {
    this.panel.hide()
  }

  onProjectChanged(projectPath:string){
    if (this.cordova.isCordovaProject(projectPath)){

      this.projectTypePanel.setProjectType('cordova');

      this.cordova.getInstalledPlatforms(projectPath).then((platforms)=>{
        this.displayInstalledPlatforms(platforms);
      });

      this.cordova.getInstalledPlugins(projectPath).then( (plugins:Array<CordovaPlugin>) => {
          //console.log("Plugins installed: ", plugins);
      });

      this.cordova.getProjectInfo(projectPath).then((pluginInfo:any)=>{
        this.projectTypePanel.setProjectInfo(pluginInfo);
      });

    } else {
      this.projectTypePanel.setProjectType('');
    }

  }

  displayInstalledPlatforms(platforms:Array<CordovaPlatform>){
    console.log("Installed platforms:", platforms);
    for (let platform of platforms) {
      console.log(platform.name);
    }
  }

  createProjectInfoElement():HTMLElement{
    this.projectIcon = createIcon('apache-cordova-big');
    let infoElement =  createElement('div', {
        elements: [
                    this.projectIcon,
                    createText('Cordova Project')
                   ],
        className:"de-workbench-project-info-container"
    })
    this.projectIcon.className = '';
    return infoElement;
  }

}
