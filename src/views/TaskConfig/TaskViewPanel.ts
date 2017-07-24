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
  createOption
} from '../../element/index';

import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { CordovaTaskConfiguration } from '../../cordova/CordovaTaskConfig'
export class TaskViewPanel extends UIBaseComponent{
  constructor(){
    super();
    this.initUI();
  }
  initUI():void{
    this.mainElement = createElement('div',{
      className:'de-workbench-taskpanel-container'
    });
    let taskContentPanel = this.createContentPanel();



    insertElement(this.mainElement,taskContentPanel);
  }

  createContentPanel():HTMLElement{
    let taskContentPanel =createElement('div',{
      className:'de-workbench-taskpanel-content',
      elements:[
        createText("todo"),
        createText("todo")
      ]
    });
    return taskContentPanel;
  }

  getConfiguration():CordovaTaskConfiguration{
    return null;
  }
}
