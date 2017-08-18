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
import { TaskUtils } from '../../tasks/TaskUtils'
import { UITreeViewModel, UITreeItem, UITreeView,UITreeViewSelectListener,findItemInTreeModel } from '../../ui-components/UITreeView'
import { find, forEach, map,clone, cloneDeep, filter, reject, remove} from 'lodash'
import { CordovaDeviceManager, CordovaDevice } from '../../cordova/CordovaDeviceManager'
import { UILineLoader } from '../../ui-components/UILineLoader'
import { UIInputFormElement } from '../../ui-components/UIInputFormElement'
import { Variant, VariantsModel, VariantsManager } from '../../DEWorkbench/VariantsManager'
import { EventEmitter }  from 'events'
import {Logger} from  '../../logger/Logger'

const NONE_PLACEHOLDER:string = '-- None -- ';
const RELOAD_DELAY:number = 500;


class TaskViewContentPanel extends UIBaseComponent{
  taskConfig:CordovaTaskConfiguration
  projectInfo:CordovaProjectInfo
  private taskNameEl:UIInputFormElement;
  private deviceManager:CordovaDeviceManager;
  private variantManager:VariantsManager;
  private platformSelect:UISelect;
  private platformSelectListener:UISelectListener;
  private deviceSelect:UISelect;
  private variantSelect:UISelect;
  private npmScriptsSelect:UISelect;
  private deviceLineLoader: UILineLoader;
  private variantsLineLoader: UILineLoader;
  private isReleaseEl:HTMLElement
  private evtEmitter:EventEmitter

  constructor(evtEmitter:EventEmitter){
    super();
    this.evtEmitter = evtEmitter;
    this.initUI();
  }

  private initUI(){
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-content',
      elements:[
      ]
    });
    this.mainElement.classList.add('form-container');
    this.createTaskNameEl();
    this.createPlatformSelect();
    this.createDeviceSelect();
    this.createReleaseCheckbox();
    this.createVariantSelect();
    this.createNodeTaskSelect();
  }


  private createTaskNameEl(){
    this.taskNameEl = new UIInputFormElement().setCaption('Task name').setPlaceholder('Your task name').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
      if(this.taskConfig){
        this.taskConfig.name = this.taskNameEl.getValue();
        this.evtEmitter.emit('didChangeName');
      }
    });
    insertElement(this.mainElement,this.taskNameEl.element());
  }

  private updateTaskName(){
    this.taskNameEl.setValue(this.taskConfig.name);
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

  private createVariantSelect(){
    this.variantsLineLoader= new UILineLoader();
    this.variantSelect = new UISelect();
    let wrapper=createElement('div',{
      className:'line-loader-wrapper',
      elements:[
        this.variantSelect.element(),
        this.variantsLineLoader.element()
      ]
    });
    let row=this.createFormRow(createText('Variant'),wrapper,'variants');
    insertElement(this.mainElement,row);
  }

  private createNodeTaskSelect(){
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
      name: NONE_PLACEHOLDER,
      value:''
    })
    this.npmScriptsSelect.setItems(model);
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

  private async updateVariants(){
    if(!this.variantManager){
      return Promise.reject('INVALID_VARIANT_MANAGER');
    }
    this.variantsLineLoader.setOnLoading(true);
    let variantModel = await this.variantManager.load();
    let model:Array<UISelectItem> = map<Variant,UISelectItem>(variantModel.variants,(variant:Variant) => {
      return {
        value:variant.name,
        name:variant.name
      }
    });
    model.unshift({
      value:'',
      name: NONE_PLACEHOLDER
    });
    this.variantSelect.setItems(model);
    this.variantsLineLoader.setOnLoading(false);
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
    if(!taskConfig){
      return;
    }
    this.taskConfig = taskConfig;
    this.projectInfo = projectInfo;
    if(!this.deviceManager){
      this.deviceManager = new CordovaDeviceManager(this.projectInfo.path);
    }
    if(!this.variantManager){
      this.variantManager = new VariantsManager(this.projectInfo.path);
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
  private setElementVisible(el:HTMLElement,visible:boolean){
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

      if(constraints.isVariantEnabled){
        this.updateVariants();
      }
      this.setRowVisible(this.createRowId('variants'),constraints.isVariantEnabled);

      if(constraints.isNodeTaskEnabled){
        this.updateNodeScripts();
      }
      this.setRowVisible(this.createRowId('npmScript'),constraints.isNodeTaskEnabled);

      if(constraints.isCustom){
        this.updateTaskName();
      }
      this.setElementVisible(this.taskNameEl.element(),constraints.isCustom);
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

  private getSelectedVariantName():string{
    let value = this.variantSelect.getSelectedItem()
    return value || null;
  }

  private getSelectedNpmScript():string {
    let value = this.npmScriptsSelect.getSelectedItem();
    return value || null;
  }

  private createReleaseCheckbox(){
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
    console.log("getCurrentConfiguration");
    let platformValue = this.platformSelect.getSelectedItem();
    if(platformValue){
      this.taskConfig.selectedPlatform = {name:platformValue};
    }
    let device = this.deviceSelect.getSelectedItem();
    if(device){
      this.taskConfig.device = {
        targetId: device,
        name:device
      };
    }
    let release = this.isReleaseEl['checked'];
    if(release){
      this.taskConfig.isRelease = true
    }
    let variant = this.getSelectedVariantName();
    if(variant){
      this.taskConfig.variantName = variant;
    }
    let nodeScript = this.getSelectedNpmScript();
    if(nodeScript){
      this.taskConfig.nodeTasks = [nodeScript];
    }
    return this.taskConfig;


  }
}



// SELECTOR PANEL



class TaskViewSelectorPanel extends UIBaseComponent implements UITreeViewSelectListener{
  private treeModel:UITreeViewModel;
  private treeView:UITreeView;
  private taskSelectionListener:(itemId:string) => void
  private cdvTasks:Array<CordovaTaskConfiguration>
  private evtEmitter:EventEmitter;
  constructor(evtEmitter:EventEmitter){
    super();
    this.evtEmitter=evtEmitter;
    this.initUI();
  }

  buildTreeModel(cvdTasks:Array<CordovaTaskConfiguration>):void{
    let customTaskNode = this.createCustomTaskNode(filter(cvdTasks,(item) => {
      return item.constraints.isCustom;
    }));
    let cvdTaskNode = this.createCdvTaskNode(reject(cvdTasks,(item) => {
      return item.constraints.isCustom;
    }));
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
      getItemById:(id:string)=>{ return findItemInTreeModel(id, this.treeModel) },
      addEventListener:(event:string,listener)=>{},
      removeEventListener:(event:string,listener)=>{},
      destroy:()=>{}
    };
  }

  initUI(){
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-tree-area',
    });
    this.createButtonToolbar();
  }

  private createButtonToolbar(){
    /*let addTaskButton = createElement('button',{
      //elements : [ createText("New...")],
      className: 'btn btn-xs icon icon-gist-new'
    })
    atom["tooltips"].add(addTaskButton, {title:'Add task'})
    addTaskButton.addEventListener('click', (evt)=>{
      this.evtEmitter.emit('didAddTask');
    })*/
    let removeTaskButton = createElement('button',{
      //elements : [ createText("Delete")],
      className: 'btn btn-xs icon icon-dash'
    })
    atom["tooltips"].add(removeTaskButton, {title:'Remove selected task'})
    removeTaskButton.addEventListener('click',()=>{
      this.evtEmitter.emit('didRemoveTask');
    })
    let cloneTaskButton = createElement('button',{
      className: 'btn btn-xs icon icon-clippy'
    })
    atom["tooltips"].add(cloneTaskButton, {title:'Clone selected Variant'})
    cloneTaskButton.addEventListener('click',()=>{
      this.evtEmitter.emit('didCloneTask');
    })
    let toolbar = createElement('div',{
      elements: [
        createElement('div', {
          elements: [removeTaskButton, cloneTaskButton],
          className: 'btn-group'
        })
      ], className: 'btn-toolbar'
    });
    insertElement(this.mainElement,toolbar);
  }

  buildAndAddTreeView(cdvTasks:Array<CordovaTaskConfiguration>){
    this.cdvTasks=cdvTasks;
    this.buildTreeModel(cdvTasks);
    if(!this.treeView){
      this.treeView = new UITreeView(this.treeModel);
      this.treeView.addEventListener('didItemSelected', this.onItemSelected.bind(this));
      insertElement(this.mainElement,this.treeView.element());
    }else{
      this.treeView.setModel(this.treeModel);
    }
  }

  createCustomTaskNode(cvdCustomTasks:Array<CordovaTaskConfiguration>):UITreeItem{
    let children = map<CordovaTaskConfiguration,UITreeItem>(cvdCustomTasks,(item:CordovaTaskConfiguration) => {
      return  { id: item.name, name: item.displayName};
    });
    return { id: 'custom', name: 'Custom', icon: null,
      expanded:true,
      children:children
    };
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
  private evtEmitter:EventEmitter;
  private lastSelected:CordovaTaskConfiguration;
  private tasks:Array<CordovaTaskConfiguration> = [];
  constructor(){
    super();
    this.evtEmitter = new EventEmitter();
    this.initUI();
  }
  initUI():void{
    this.mainElement = createElement('div',{
      className:'de-workbench-taskpanel-container'
    });
    this.threeViewPanel = this.createTreeViewPanel();
    this.threeViewPanel.setOnTaskChangeListener((itemId:string) => {
      let config= this.getTaskConfigurationByName(itemId);
      console.log("getTaskConfigurationByName return",config,"For name",itemId);
      if(config){
        this.lastSelected = config;
      }
      this.taskContentPanel.contextualize(config,this.project);
    });

    this.evtEmitter.addListener('didAddTask',() => {
      console.log("Add task");
    });
    this.evtEmitter.addListener('didRemoveTask',() => {
      console.log("Remove task");
      let target= this.lastSelected;
      if(target.constraints.isCustom){
        this.removeTask(target);
      }
      setTimeout(() => {
          this.update();
      });
    });
    let timer=null;
    this.evtEmitter.addListener('didChangeName',() => {
      if(timer){
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        this.update();
      },RELOAD_DELAY);
    })

    this.evtEmitter.addListener('didCloneTask',() => {
      console.log("Duplicate task");
      if(this.lastSelected){
        this.cloneAndAddNewTasks(this.lastSelected);
        setTimeout(() => {
            this.update();
        });
      }
    });
    this.taskContentPanel = this.createContentPanel();
    insertElement(this.mainElement,this.threeViewPanel.element());
    insertElement(this.mainElement,this.taskContentPanel.element());
  }

  private createContentPanel():TaskViewContentPanel{
    let taskContentPanel = new TaskViewContentPanel(this.evtEmitter);
    return taskContentPanel;
  }

  private createTreeViewPanel():TaskViewSelectorPanel{
    let taskThreeViewContainer = new TaskViewSelectorPanel(this.evtEmitter);
    return taskThreeViewContainer;
  }

  setProject(project:CordovaProjectInfo):void{
    this.project= project;
    this.loadTasks();
  }

  loadTasks(){
    TaskProvider.getInstance().loadTasksForProject(this.project.path).then((tasks) => {
      Logger.getInstance().debug("Task loading done");
      this.tasks = tasks;
      this.update();
    },(err) => {
      Logger.getInstance().error(err)
    });
  }

  private update(){
    this.threeViewPanel.buildAndAddTreeView(this.tasks);
  }

  private getTaskConfigurationByName(name:string):CordovaTaskConfiguration{
    return find(this.tasks,(single:CordovaTaskConfiguration) => {
      return single.name == name;
    });
  }

  private cloneAndAddNewTasks(lastSelected:CordovaTaskConfiguration){
    let newTask = cloneDeep(lastSelected);
    newTask.name = TaskUtils.createUniqueTaskName(this.tasks,lastSelected.name);
    newTask.constraints.isCustom = true;
    this.tasks.push(newTask);
  }

  private removeTask(task:CordovaTaskConfiguration){
    remove(this.tasks,(item:CordovaTaskConfiguration) => {
      return item.name == task.name;
    });
  }

  public getConfiguration():CordovaTaskConfiguration{
    return this.taskContentPanel.getCurrentConfiguration();
  }

  public saveAllConfiguration(){
    if(this.project){
      TaskProvider.getInstance().storeTasks(this.tasks,this.project.path);
    }
  }
}
