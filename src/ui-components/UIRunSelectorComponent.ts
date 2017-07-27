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
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import { CordovaProjectInfo } from '../cordova/Cordova'
import * as _ from 'lodash'
import * as path from 'path'

export class UIRunSelectorComponent extends UIBaseComponent {
  projectSelector:UISelect = null;
  selectButton:UISelectButton;
  taskSelector:HTMLElement = null;
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
    this.selectButton = new UISelectButton(this.projectSelector,"Select Project",{ withArrow: true});
    insertElement(this.mainElement,this.selectButton.element());
    let tasks:Array<any> = []; //TODO
    this.taskSelector = createButton({
      className:"task-btn"
    },[
      createText("...")
    ]);
    insertElement(this.mainElement,this.taskSelector);
    this.taskSelector.addEventListener('click',this.onTaskSelectClick.bind(this));
  }

  subscribeEvents(){
    ProjectManager.getInstance().didPathChanged(this.reloadProjectList.bind(this));
  }

  reloadProjectList(){
    console.log("reloadProjectList");
    let projects:Array<string> = this.getAllAvailableProjects();
    let items:Array<UISelectItem> = this.createProjectSelectOptions(projects);
    this.projectSelector.setItems(items);
    this.selectButton.setSelectedItem(items[0].value)
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
      ProjectManager.getInstance().cordova.getCordovaProjectInfo(path).then((info:CordovaProjectInfo) => {
          console.log(info);
          this.events.emit('didSelectProjectForRun',info);
      },(reason) => {
        console.error(reason);
      }).catch((err) => {
        console.error(err);
      })

    })
  }

  destroy(){
    this.taskSelector.removeEventListener('click',this.onTaskSelectClick.bind(this));
    this.projectSelector.removeSelectListener(this.projectSelectListener);
    this.selectButton.destroy();
    this.element().remove();
  }


}
