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
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import * as _ from 'lodash'
import * as path from 'path'

export class UIRunComponent extends UIBaseComponent {
  projectSelector:UISelect = null;
  taskSelector:HTMLElement = null;
  constructor(){
    super();
    this.initUI();
  }

  initUI():void{
    this.mainElement = createElement('div',{
      className: "de-workbench-uiruncomponent-container"
    });
    let projects:Array<string> = this.getAllAvailableProjects();
    this.projectSelector=this.createProjectSelector(projects);
    insertElement(this.mainElement,createButton({
      className:"select-btn"
    },[
      createText("Select project"),
      this.projectSelector.element(),
      createElement('div', {
        className: 'bugs-scheme-arrow'
      })
    ]));

    let tasks:Array<any> = []; //TODO
    this.taskSelector = createButton({
      className:"task-btn"
    },[
      createText("...")
    ]);
    insertElement(this.mainElement,this.taskSelector);

  }
  getAllAvailableProjects():Array<string>{
    return ProjectManager.getInstance().getAllAvailableProjects();
  }

  createProjectSelector(projects:Array<string>):UISelect{
    let options:Array<UISelectItem> = [];
    if(!projects || projects.length == 0){
      options.push({
        name:'No projects',
        value:''
      });
      return new UISelect(options);
    }
    _.forEach(projects,(item) => {
      options.push({
        name: path.dirname(item),
        value:item
      })
    })
    console.log("OPTIONS:",options);
    return new UISelect(options);
  }


}
