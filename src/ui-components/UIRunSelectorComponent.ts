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

export class UIRunSelectorComponent extends UIBaseComponent {
  projectSelector:UISelect = null;
  selectButton:UISelectButton;
  taskSelector:HTMLElement = null;
  taskSelectorText:Text = null;
  taskInfo:CordovaTaskConfiguration;
  events:EventEmitter
  projectSelectListener:UISelectListener;
  constructor(events:EventEmitter){
    super();
    this.events = events;
    this.projectSelectListener = {
      onItemSelected:(selection:string) => {
        this.onSelectProject(selection);
      }
    }
    this.initUI();
    this.subscribeEvents();
  }

  initUI():void{
    this.mainElement = createElement('div',{
      className: "de-workbench-uiruncomponent-container"
    });
    let projects:Array<string> = this.getAllAvailableProjects();
    this.projectSelector=this.createProjectSelector(projects);
    this.projectSelector.addSelectListener(this.projectSelectListener);
    this.selectButton = new UISelectButton(this.projectSelector,"Select Project",{ withArrow: true, rightIcon:'arrow-down'});
    insertElement(this.mainElement,this.selectButton.element());
    this.addTaskSelectorButton();
    //this.addStatusIndicator();
    this.taskSelector.addEventListener('click',this.onTaskSelectClick.bind(this));
  }

  addTaskSelectorButton(){
    let tasks:Array<any> = []; //TODO
    this.taskSelectorText = createText("...");
    this.taskSelector = createButton({
      className:"task-btn"
    },[
      this.taskSelectorText
    ]);
    insertElement(this.mainElement,this.taskSelector);
  }
  /*addStatusIndicator():void {
    let statusContainer = new UIStatusIndicatorComponent("No task in progress");
    insertElement(this.mainElement,statusContainer.element());
  }*/

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

  onTaskSelectClick(){
    console.log("onTaskSelectClick");
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
    this.taskSelectorText.textContent = taskInfo == null ? '...' : taskInfo.name;
  }

  setTaskConfiguration(taskInfo:CordovaTaskConfiguration):void{
    this.taskInfo = taskInfo;
    this.updateTaskText(taskInfo);

  }
  getTaskConfiguration():CordovaTaskConfiguration {
    return this.taskInfo;
  }

  setEnable(value:boolean){
    this.projectSelector.setEnable(value);
  }

  destroy(){
    this.taskSelector.removeEventListener('click',this.onTaskSelectClick.bind(this));
    this.projectSelector.removeSelectListener(this.projectSelectListener);
    this.selectButton.destroy();
    this.element().remove();
  }


}
