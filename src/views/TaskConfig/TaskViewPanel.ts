'use babel'
import {
  createText,
  createElement,
  insertElement,
  createGroupButtons,
  createButton,
  createIcon,
  createIconFromPath,
  attachEventFromObject,
  createTextEditor,
  createSelect,
  createOption,
  createControlBlock
} from '../../element/index';

import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UISelect, UISelectItem } from '../../ui-components/UISelect'
import { CordovaPlatform, CordovaProjectInfo } from '../../cordova/Cordova'
import { CordovaTaskConfiguration,CordovaTask } from '../../cordova/CordovaTasks'
import { TaskManager } from '../../tasks/TaskManager'
import { UITreeViewModel, UITreeItem, UITreeView,UITreeViewSelectListener,findItemInTreeModel } from '../../ui-components/UITreeView'
import { find,forEach,map } from 'lodash'
import { CordovaDeviceManager, CordovaDevice } from '../../cordova/CordovaDeviceManager'

class TaskViewContentPanel extends UIBaseComponent{
  taskConfig:CordovaTaskConfiguration
  projectInfo:CordovaProjectInfo
  private deviceManager:CordovaDeviceManager;
  private platformSelect:UISelect;
  private deviceSelect:UISelect;
  private isRelease:HTMLElement

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
  }
  private createPlatformSelect(){
    this.platformSelect = new UISelect();
    let row=this.createFormRow(createText('Platform'),this.platformSelect.element());
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

  private createDeviceSelect(){
    this.deviceSelect = new UISelect();
    let row=this.createFormRow(createText('Device / Emulator'),this.deviceSelect.element());
    insertElement(this.mainElement,row);
  }

  private async updateDevices(platform:CordovaPlatform){
    /*let model:Array<UISelectItem> = [{
      value:'[AUTO]',
      name: '-- Auto --'
    }]*/
    if(!this.deviceManager || !platform){
      return Promise.resolve([]);
    }
    let devices= await this.deviceManager.getDeviceList(platform.name);
    let model:Array<UISelectItem> = map<CordovaDevice,UISelectItem>(devices,(single:CordovaDevice) => {
      return {
        value:single.targetId,
        name:single.name
      }
    });
    this.deviceSelect.setItems(model)
  }

  private createFormRow(text:Text,element:HTMLElement):HTMLElement{
    let row=createElement('div',{
      className:'control-row',
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

  private contextualizeImpl(){
    if(!this.getSelectedPlatform()){
      this.updatePlatforms();
    }
    this.updateDevices(this.getSelectedPlatform());
  }

  private getSelectedPlatform():CordovaPlatform{
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      return { name:platformValue };
    }
    return null;
  }

  getCurrentConfiguration():CordovaTaskConfiguration{
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      this.taskConfig.selectedPlatform = {name:platformValue};
    }
    return this.taskConfig;
  }
}

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
      getItemById:findItemInTreeModel
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
    this.treeView.addSelectListener(this);
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
    this.threeViewPanel.buildAndAddTreeView(TaskManager.getInstance().getDefaultTask());
  }

  private getTaskConfigurationByName(name:string):CordovaTaskConfiguration{
    let tasks = TaskManager.getInstance().getDefaultTask();
    return find(tasks,(single:CordovaTaskConfiguration) => {
      return single.name == name;
    });
  }


  getConfiguration():CordovaTaskConfiguration{
    return this.taskContentPanel.getCurrentConfiguration();
  }
}
