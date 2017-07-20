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

import { UIComponent, UIBaseComponent } from './UIComponent'
import { UISelect ,UISelectItem} from './UISelect'
import { UISelectButton } from './UISelectButton'
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import * as _ from 'lodash'
import * as path from 'path'

export class UIRunSelectorComponent extends UIBaseComponent {
  projectSelector:UISelect = null;
  selectButton:UISelectButton;
  taskSelector:HTMLElement = null;
  constructor(){
    super();
    this.initUI();
    this.subscribeEvents();
  }

  initUI():void{
    this.mainElement = createElement('div',{
      className: "de-workbench-uiruncomponent-container"
    });
    let projects:Array<string> = this.getAllAvailableProjects();
    this.projectSelector=this.createProjectSelector(projects);
    this.selectButton = new UISelectButton(this.projectSelector);
    insertElement(this.mainElement,this.selectButton.element());
    let tasks:Array<any> = []; //TODO
    this.taskSelector = createButton({
      className:"task-btn"
    },[
      createText("...")
    ]);
    insertElement(this.mainElement,this.taskSelector);
  }

  subscribeEvents(){
    ProjectManager.getInstance().didProjectChanged(this.reloadProjectList.bind(this));
  }

  reloadProjectList(){
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

  destroy(){
    //TODO
  }


}
