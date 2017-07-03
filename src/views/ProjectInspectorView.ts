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
import { UIListView, UIListViewModel } from '../ui-components/UIListView'
import { ProjectTypePanel } from '../ui-components/ProjectTypePanel'
import { Logger } from '../logger/Logger'

class InstalledPlatformsModel implements UIListViewModel {

  data: Array<CordovaPlatform>;

  constructor(){
  }

  setData(data:Array<CordovaPlatform>){
    this.data = data;
  }

  hasHeader():boolean {
    return false;
  }
  getRowCount():number {
    if (this.data){
      return this.data.length;
    } else {
      return 0;
    }
  }
  getColCount():number {
    return 1;
  }
  getValueAt(row:number, col:number){
    let platformInfo = this.data[row];
    return platformInfo.name;
  }
  getClassNameAt(row:number, col:number){
    return null;
  }
  getColumnName(col:number):string {
    return "" + col;
  }
  getClassName():string {
    return 'installed-platforms-list';
  }
}

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
  private installedPlatformsLV: UIListView;
  private installedPlatformsModel: InstalledPlatformsModel;

  constructor () {
    Logger.getInstance().debug("ProjectInspectorView initializing...");

    this.atomWorkspace = atom.workspace;
    this.events = new EventEmitter()

    // create Cordova utilities and tools
    this.cordova = new Cordova();

    this.initUI();

    this.projectTypePanel.setProjectType('');

    // Listen events
    ProjectManager.getInstance().didProjectChanged((projectPath)=>this.onProjectChanged(projectPath));
  }

  /**
   * Initialize the UI
   */
  initUI() {
    Logger.getInstance().debug("ProjectInspectorView initUI called...");

    // Create the models
    this.installedPlatformsModel = new InstalledPlatformsModel();

    // create components
    this.installedPlatformsLV = new UIListView(this.installedPlatformsModel);

    // Create the main UI
    this.element = document.createElement('de-workbench-project-inspector') //'de-workbench-projinspector-view'

    this.projectTypePanel = new ProjectTypePanel();
    insertElement(this.element, this.projectTypePanel.element())

    let el = createElement('de-workbench-group', {
        elements: [
          createElement('de-workbench-group-header', {
            elements: [
              createText('Installed Platforms')
            ]
          }),
          this.installedPlatformsLV.element()
        ]
    });
    insertElement(this.element, el)

    Logger.getInstance().debug("ProjectInspectorView initUI done.");
  }

  /**
   * Open this view
   */
  open () {
    Logger.getInstance().debug("ProjectInspectorView open called...");
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

  /**
   * close this view
   */
  close () {
    this.panel.hide()
  }

  /**
   * Called when the current project changes
   */
  onProjectChanged(projectPath:string){

    if (this.cordova.isCordovaProject(projectPath)){

      this.projectTypePanel.setProjectType('cordova');

      this.cordova.getInstalledPlatforms(projectPath).then((platforms)=>{
        this.displayInstalledPlatforms(platforms);
      });

      this.cordova.getProjectInfo(projectPath).then((pluginInfo:any)=>{
        this.projectTypePanel.setProjectInfo(pluginInfo);
      });

    } else {
      this.projectTypePanel.setProjectType('');
    }

  }

  /**
   * Display current installed platform
   */
  displayInstalledPlatforms(platforms:Array<CordovaPlatform>){
    Logger.getInstance().debug("displayInstalledPlatforms called for ", platforms);
    for (let platform of platforms) {
      console.log(platform.name);
    }
    // update the model
    this.installedPlatformsModel.setData(platforms);
    // notify the component
    this.installedPlatformsLV.modelChanged();
  }

  /**
   * Create the Project Info panel
   */
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
