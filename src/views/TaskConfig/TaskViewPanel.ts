'use babel'
import {
  createText,
  createElement,
  insertElement,
  createButton,
  createIcon,
  attachEventFromObject,
  createSelect,
  createInput
} from '../../element/index';

import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UISelect, UISelectItem, UISelectListener } from '../../ui-components/UISelect'
import { CordovaPlatform, CordovaProjectInfo } from '../../cordova/Cordova'
import { CordovaTaskConfiguration, CordovaTask, TaskConstraints } from '../../cordova/CordovaTasks'
import { TaskProvider } from '../../tasks/TaskProvider'
import { UITreeViewModel, UITreeItem, UITreeView,UITreeViewSelectListener,findItemInTreeModel } from '../../ui-components/UITreeView'
import { find,forEach,map } from 'lodash'
import { CordovaDeviceManager, CordovaDevice } from '../../cordova/CordovaDeviceManager'
import { UILineLoader } from '../../ui-components/UILineLoader'

class TaskViewContentPanel extends UIBaseComponent{
  taskConfig:CordovaTaskConfiguration
  projectInfo:CordovaProjectInfo
  private deviceManager:CordovaDeviceManager;
  private platformSelect:UISelect;
  private platformSelectListener:UISelectListener;
  private deviceSelect:UISelect;
  private npmScriptsSelect:UISelect;
  private deviceLineLoader: UILineLoader;
  private isReleaseEl:HTMLElement

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-content',
      elements:[
      ]
    });
    this.mainElement.classList.add('form-container');
    this.createPlatformSelect();
    this.createDeviceSelect();
    this.createCheckboxSelect();
    this.createNodeTaskSelector();
    //this.createMockPanel();
  }

  private createPlatformSelect(){
    this.platformSelect = new UISelect();
    this.platformSelectListener = {
      onItemSelected:() => {
        this.updateDevices(this.getSelectedPlatform());
      }
    };
    this.platformSelect.addSelectListener(this.platformSelectListener);
    let row=this.createFormRow(createText('Platform'),this.platformSelect.element(),'platforms');
    insertElement(this.mainElement,row);
  }

  private updatePlatforms(){
    let platforms:Array<CordovaPlatform> = this.projectInfo? this.projectInfo.platforms: [];
    let model:Array<UISelectItem> = map <CordovaPlatform,UISelectItem> (platforms, (single:CordovaPlatform) => {
      return {
        value:single.name,
        name:single.name
      };
    });
    this.platformSelect.setItems(model)
  }

  private createNodeTaskSelector(){
    this.npmScriptsSelect = new UISelect();
    let row=this.createFormRow(createText('Npm scripts (before task)'),this.npmScriptsSelect.element(),'npmScript');
    insertElement(this.mainElement,row);
  }

  private updateNodeScripts(){
    let npmScripts:Array<string> = this.projectInfo ? this.projectInfo.npmScripts : [];
    let model:Array<UISelectItem> = map<any,UISelectItem>(npmScripts,(value:string ,key:string) => {
      return {
        name:key,
        value:key
      }
    });
    model.unshift({
      name:'-- None -- ',
      value:''
    })
    this.npmScriptsSelect.setItems(model);
  }

  private createMockPanel(){

  }

  private createDeviceSelect(){
    this.deviceSelect = new UISelect();
    this.deviceLineLoader= new UILineLoader();
    let wrapper=createElement('div',{
      className:'line-loader-wrapper',
      elements:[
        this.deviceSelect.element(),
        this.deviceLineLoader.element()
      ]
    });
    let row=this.createFormRow(createText('Device / Emulator'),wrapper,'devices');
    insertElement(this.mainElement,row);
  }

  private async updateDevices(platform:CordovaPlatform){
    if(!this.deviceManager || !platform){
      return Promise.resolve([]);
    }
    this.deviceLineLoader.setOnLoading(true);
    let devices= await this.deviceManager.getDeviceList(platform.name);
    let model:Array<UISelectItem> = map<CordovaDevice,UISelectItem>(devices,(single:CordovaDevice) => {
      return {
        value:single.targetId,
        name:single.name
      }
    });
    this.deviceSelect.setItems(model)
    this.deviceLineLoader.setOnLoading(false);
  }

  private createRowId(elementId:string):string{
    return "row-" + elementId;
  }

  private createFormRow(text: HTMLElement | Text,element:HTMLElement,rowId?:string):HTMLElement{
    let row=createElement('div',{
      className:'control-row',
      id: this.createRowId(rowId || element.id),
      elements:[
        text,
        element]
    });
    return row;
  }

  contextualize(taskConfig:CordovaTaskConfiguration,projectInfo:CordovaProjectInfo){
    this.taskConfig = taskConfig;
    this.projectInfo = projectInfo;
    if(!this.deviceManager){
      this.deviceManager = new CordovaDeviceManager(this.projectInfo.path);
    }
    setTimeout(() => {
      this.contextualizeImpl();
    });
  }

  private setRowVisible(rowId:string,visible:boolean){
    var el = document.getElementById(rowId);
    if(el && el.style){
      el.style.display = visible? 'block' : 'none';
    }
  }

  private contextualizeImpl(){
    if(!this.getSelectedPlatform()){
      this.updatePlatforms();
    }
    this.applyConstraintsToView(this.taskConfig.constraints);
  }

  private applyConstraintsToView(constraints:TaskConstraints){
      if(constraints.isDeviceEnabled){
        this.updateDevices(this.getSelectedPlatform());
      }
      this.setRowVisible(this.createRowId('devices'),constraints.isDeviceEnabled);

      if(constraints.isNodeTaskEnabled){
        this.updateNodeScripts();
      }
      this.setRowVisible(this.createRowId('npmScript'),constraints.isNodeTaskEnabled);
  }

  private getSelectedPlatform():CordovaPlatform{
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      return { name:platformValue };
    }
    return null;
  }

  private getSelectedDevice():CordovaDevice {
    let value= this.deviceSelect.getSelectedItem();
    if(value){
      return {
        targetId:value,
        name:value
      }
    }
    return null;
  }

  private createCheckboxSelect(){
    this.isReleaseEl = createInput({
      type:'checkbox'
    });
    this.isReleaseEl.classList.remove('form-control');
    this.isReleaseEl.setAttribute('name','release');
    let label:HTMLElement= createElement('label',{
      className:"label-for"
    });
    label.innerText = 'Release'
    label.setAttribute('for','release');
    let row= this.createFormRow(label,this.isReleaseEl,'isRelease')
    insertElement(this.mainElement,row);
  }

  getCurrentConfiguration():CordovaTaskConfiguration{
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      this.taskConfig.selectedPlatform = {name:platformValue};
    }
    return this.taskConfig;
  }
}



// SELECTOR PANEL



class TaskViewSelectorPanel extends UIBaseComponent implements UITreeViewSelectListener{
  private treeModel:UITreeViewModel;
  private treeView:UITreeView;
  private taskSelectionListener:(itemId:string) => void
  constructor(){
    super();
    this.initUI();
  }
  buildTreeModel(cvdTask:Array<CordovaTaskConfiguration>):void{
    let customTaskNode = this.createCustomTaskNode();
    let cvdTaskNode = this.createCdvTaskNode(cvdTask);
    let root:UITreeItem = {
      id : 'root',
      name: 'task',
      expanded : true,
      children: [
          cvdTaskNode,
          customTaskNode
      ]
    };
    this.treeModel = {
      root: root,
      getItemById:findItemInTreeModel,
      addEventListener:(event:string,listener)=>{},
      removeEventListener:(event:string,listener)=>{},
      destroy:()=>{}
    };
  }
  initUI(){
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-tree-area',
    });
  }
  buildAndAddTreeView(cvdTask:Array<CordovaTaskConfiguration>){
    this.buildTreeModel(cvdTask);
    this.treeView = new UITreeView(this.treeModel);
    this.treeView.addEventListener('didItemSelected', (itemId,item)=> { this.onItemSelected(itemId, item) });
    insertElement(this.mainElement,this.treeView.element());
  }
  createCustomTaskNode():UITreeItem{
    //TODO load from project file
    return { id: 'custom', name: 'Custom', icon: 'test-ts-icon'};
  }

  createCdvTaskNode(cvdTask:Array<CordovaTaskConfiguration>):UITreeItem{
    let children = map<CordovaTaskConfiguration,UITreeItem>(cvdTask,(item:CordovaTaskConfiguration) => {
      return  { id: item.name, name: item.displayName};
    });
    return { id: 'default', name: 'Cordova', icon: null,
      expanded : true,
      children: children
    };
  }

  onItemSelected(itemId:string,item:UITreeItem){
    console.log("selected: ",itemId,item);
    if(this.taskSelectionListener){
      this.taskSelectionListener(itemId);
    }
  }

  setOnTaskChangeListener(callback: (itemId:string) => void):void{
    this.taskSelectionListener = callback;
  }

}



// VIEW PANEL (aka main panel)

export class TaskViewPanel extends UIBaseComponent{
  private threeViewPanel: TaskViewSelectorPanel;
  private taskContentPanel : TaskViewContentPanel;
  private project:CordovaProjectInfo;
  constructor(){
    super();
    this.initUI();
  }
  initUI():void{
    this.mainElement = createElement('div',{
      className:'de-workbench-taskpanel-container'
    });
    this.threeViewPanel = this.createTreeViewPanel();
    this.threeViewPanel.setOnTaskChangeListener((itemId:string) => {
      let config= this.getTaskConfigurationByName(itemId);
      this.taskContentPanel.contextualize(config,this.project);
    });
    this.taskContentPanel = this.createContentPanel();
    insertElement(this.mainElement,this.threeViewPanel.element());
    insertElement(this.mainElement,this.taskContentPanel.element());
  }

  private createContentPanel():TaskViewContentPanel{
    let taskContentPanel = new TaskViewContentPanel();
    return taskContentPanel;
  }

  private createTreeViewPanel():TaskViewSelectorPanel{
    let taskThreeViewContainer = new TaskViewSelectorPanel();
    return taskThreeViewContainer;
  }

  setProject(project:CordovaProjectInfo):void{
    this.project= project;
    this.update();
  }

  private update(){
    this.threeViewPanel.buildAndAddTreeView(TaskProvider.getInstance().getDefaultTask());
  }

  private getTaskConfigurationByName(name:string):CordovaTaskConfiguration{
    let tasks = TaskProvider.getInstance().getDefaultTask();
    return find(tasks,(single:CordovaTaskConfiguration) => {
      return single.name == name;
    });
  }


  getConfiguration():CordovaTaskConfiguration{
    return this.taskContentPanel.getCurrentConfiguration();
  }
}
