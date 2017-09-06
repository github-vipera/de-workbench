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

import { UIBaseComponent } from '../../ui-components/UIComponent'
import { CordovaProjectInfo } from '../../cordova/Cordova'
import { CordovaTaskConfiguration, CordovaTask } from '../../cordova/CordovaTasks'
import { TaskProvider } from '../../tasks/TaskProvider'
import { TaskUtils } from '../../tasks/TaskUtils'
import { find, clone, cloneDeep, remove, findIndex } from 'lodash'
import { EventEmitter }  from 'events'
import { Logger } from  '../../logger/Logger'
import { TaskViewContentPanel } from './TaskViewContentPanel'
import { TaskViewSelectorPanel } from './TaskViewSelectorPanel'
const RELOAD_DELAY:number = 500;

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
      this.applyConfigToModel(this.lastSelected);
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
        this.lastSelected = null;
      }
      setTimeout(() => {
          this.update();
          this.taskContentPanel.resetContext();
      });
    });
    let timer=null;
    this.evtEmitter.addListener('didChangeName',(nodeId:string) => {
      if(timer){
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        timer = null;
        this.update();
        this.threeViewPanel.setSelected(nodeId,true);
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
    }).catch((ex) => {
      Logger.getInstance().error(ex);
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

  private applyConfigToModel(config:CordovaTaskConfiguration){
    this.taskContentPanel.getCurrentConfiguration();
  }

  public saveAllConfiguration(){
    if(this.lastSelected){
      this.applyConfigToModel(this.lastSelected);
    }
    if(this.project){
      TaskProvider.getInstance().storeTasks(this.tasks,this.project.path);
    }
  }
}
