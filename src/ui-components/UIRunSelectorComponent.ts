'use babel'

import {
  createText,
  createSelect,
  createElement,
  insertElement,
  createGroupButtons,
  createButton,
  createIcon,
  createIconFromPath,
  attachEventFromObject,
  createTextEditor
} from '../element/index';
import { EventEmitter }  from 'events';
import { UIComponent, UIBaseComponent } from './UIComponent'
import { UISelect, UISelectItem, UISelectListener} from './UISelect'
import { UISelectButton } from './UISelectButton'
import { UIStatusIndicatorComponent , UIIndicatorStatus } from './UIStatusIndicatorComponent'
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import { CordovaProjectInfo } from '../cordova/Cordova'
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks'
import * as _ from 'lodash'
import * as path from 'path'

export interface UITaskInfo {
  id:string;
  name:string;
}

const OPEN_TASK_CONF:UISelectItem = {
  name:'Custom...',
  value:''
};

export class UIRunSelectorComponent extends UIBaseComponent {
  private projectSelector:UISelect = null;
  private selectButton:UISelectButton;
  private taskSelect:UISelect = null;
  private taskSelectButton:UISelectButton;
  private taskInfo:CordovaTaskConfiguration;
  private events:EventEmitter
  private projectSelectListener:UISelectListener;
  private taskSelectListener:UISelectListener;
  private taskHistory:Array<CordovaTaskConfiguration> = [];
  constructor(events:EventEmitter){
    super();
    this.events = events;
    this.projectSelectListener = {
      onItemSelected:(selection:string) => {
        this.onSelectProject(selection);
      }
    }
    this.taskSelectListener = {
      onItemSelected:(selection:string) => {
        if(!selection){
          this.onCustomTaskSelectClick();
          setTimeout(() => {
            this.taskSelectButton.resetSelection();
          },20);
        }
      }
    };
    this.initUI();
    this.subscribeEvents();
  }

  initUI():void{
    this.mainElement = createElement('div',{
      className: "de-workbench-uiruncomponent-container"
    });
    this.addProjectSelector();
    //this.addTaskSelectorButton();
    this.addTaskSelector();
  }

  addProjectSelector(){
    let projects:Array<string> = this.getAllAvailableProjects();
    this.projectSelector=this.createProjectSelector(projects);
    this.projectSelector.addSelectListener(this.projectSelectListener);
    this.projectSelector.resetSelection();
    this.selectButton = new UISelectButton(this.projectSelector,"Select Project",{ withArrow: true, rightIcon:'arrow-down'});
    insertElement(this.mainElement,this.selectButton.element());
  }

  /*addTaskSelectorButton(){
    let tasks:Array<any> = []; //TODO
    this.taskSelectorText = createText("...");
    this.taskSelector = createButton({
      className:"task-btn"
    },[
      this.taskSelectorText
    ]);
    insertElement(this.mainElement,this.taskSelector);
    this.taskSelector.addEventListener('click',this.onTaskSelectClick.bind(this));
  }*/


  addTaskSelector(){
    this.taskSelect = this.createTaskSelect();
    this.taskSelect.resetSelection();
    this.taskSelect.addSelectListener(this.taskSelectListener);
    this.taskSelectButton = new UISelectButton(this.taskSelect,"...",{ withArrow: false, rightIcon:'arrow-down'});
    insertElement(this.mainElement,this.taskSelectButton.element());
  }

  subscribeEvents(){
    ProjectManager.getInstance().didPathChanged(this.reloadProjectList.bind(this));
  }

  reloadProjectList(){
    console.log("reloadProjectList");
    let projects:Array<string> = this.getAllAvailableProjects();
    let items:Array<UISelectItem> = this.createProjectSelectOptions(projects);
    let selected:string = this.projectSelector.getSelectedItem();
    this.projectSelector.setItems(items);
    let reloadSelection:boolean = (!selected || selected != this.projectSelector.getSelectedItem()) ? true : false;
    if(reloadSelection){
      this.selectButton.setSelectedItem(items[0].value)
      this.onSelectProject(items[0].value);
    }
  }

  getAllAvailableProjects():Array<string>{
    return ProjectManager.getInstance().getAllAvailableProjects();
  }

  createProjectSelector(projects:Array<string>):UISelect{
    let options:Array<UISelectItem> = this.createProjectSelectOptions(projects);
    console.log("OPTIONS:",options);
    return new UISelect(options);
  }

  createProjectSelectOptions(projects:Array<string>):Array<UISelectItem>{
    let options:Array<UISelectItem> = [];
    if(!projects || projects.length == 0){
      options.push({
        name:'No projects',
        value:''
      });
      return options;
    }
    _.forEach(projects,(item) => {
      options.push({
        name: path.basename(item),
        value:item
      })
    })
    return options;
  }

  createTaskSelect(){
    let options:Array<UISelectItem> = this.createTaskSelectOptions(this.taskHistory);
    return new UISelect(options);
  }

  reloadTaskList(){
    this.taskSelect.setItems(this.createTaskSelectOptions(this.taskHistory))
  }

  createTaskSelectOptions(tasks:Array<CordovaTaskConfiguration>):Array<UISelectItem>{
    let options:Array<UISelectItem> = [];
    _.forEach(tasks,(item) => {
      options.push({
        name: item.displayName,
        value: item.name
      })
    })
    options.push(OPEN_TASK_CONF);
    return options;
  }

  onCustomTaskSelectClick(){
    console.log("onCustomTaskSelectClick");
    this.events.emit('didSelectTaskClick');
  }

  onSelectProject(path:string){
    console.log("onSelectProject",path);
    setTimeout(() => {
      ProjectManager.getInstance().cordova.getProjectInfo(path).then((info:CordovaProjectInfo) => {
          console.log(info);
          this.events.emit('didSelectProjectForRun',info);
      },(reason) => {
        console.error(reason);
      }).catch((err) => {
        console.error(err);
      })

    })
  }

  private updateTaskText(taskInfo:CordovaTaskConfiguration){
    if(!taskInfo){
      this.taskSelectButton.resetSelection();
    }else{
      this.taskSelectButton.setSelectedItem(taskInfo.name);
    }
  }

  setTaskConfiguration(taskInfo:CordovaTaskConfiguration):void{
    this.taskInfo = taskInfo;
    this.addTaskToHistory(taskInfo)
    this.reloadTaskList();
    this.updateTaskText(taskInfo);
  }

  clearHistory(){
    this.taskHistory = [];
  }

  private addTaskToHistory(taskInfo:CordovaTaskConfiguration){
    if(!taskInfo){
      return;
    }
    this.taskHistory.unshift(taskInfo);
    this.taskHistory = this.taskHistory.slice(0,5);
  }

  getTaskConfiguration():CordovaTaskConfiguration {
    return this.taskInfo;
  }

  setEnable(value:boolean){
    this.projectSelector.setEnable(value);
  }

  destroy(){
    //this.taskSelector.removeEventListener('click',this.onTaskSelectClick.bind(this));
    this.taskSelect.removeSelectListener(this.taskSelectListener);
    this.projectSelector.removeSelectListener(this.projectSelectListener);
    this.selectButton.destroy();
    this.element().remove();
  }


}
