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
import { CordovaTaskConfiguration,CordovaTask } from '../../cordova/CordovaTasks'
import { UITreeViewModel, UITreeItem, UITreeView,UITreeViewSelectListener,findItemInTreeModel } from '../../ui-components/UITreeView'
import { find,forEach } from 'lodash'

class TaskViewContentPanel extends UIBaseComponent{
  constructor(){
    super();
    this.initUI();
  }
  initUI(){
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-content',
      elements:[
      ]
    });
  }
  contextualize(selectedTask:CordovaTask,projectInfo){
    //TODO
  }
}

class TaskViewSelectorPanel extends UIBaseComponent implements UITreeViewSelectListener{
  treeModel:UITreeViewModel;
  treeView:UITreeView;
  taskSelectionListener:(itemId:string) => void
  constructor(){
    super();
    this.buildTreeModel();
    this.initUI();
  }
  buildTreeModel():void{
    let customTaskNode= this.createCustomTaskNode();
    let root:UITreeItem = {
      id : 'root',
      name: 'task',
      expanded : true,
      children: [
          { id: 'default', name: 'Cordova', icon: null,
            expanded : true,
            children: [
              { id: 'cordovaPrepare', name: 'Prepare'},
              { id: 'cordovaBuild', name: 'Build'},
              { id: 'cordovaRun', name: 'Run'},
              { id: 'cordovaBuildRun', name: 'Build & Run'}
            ]
          },
          customTaskNode
      ]
    };
    this.treeModel = {
      root: root,
      getItemById:findItemInTreeModel
    };

  }
  initUI(){
    this.treeView = new UITreeView(this.treeModel);
    this.treeView.addSelectListener(this);
    this.mainElement = createElement('atom-panel',{
      className:'de-workbench-taskpanel-tree-area',
      elements:[
        this.treeView.element()
      ]
    });
  }
  createCustomTaskNode():UITreeItem{
    //TODO load from project file
    return { id: 'custom', name: 'Custom', icon: 'test-ts-icon'};
  }

  onItemSelected(itemId:string,item){
    console.log("selected: ",itemId,item);
    if(this.taskSelectionListener){
      this.taskSelectionListener(item);
    }
  }

  setOnTaskChangeListener(callback: (itemId:string) => void):void{
    this.taskSelectionListener = callback;
  }

}

export class TaskViewPanel extends UIBaseComponent{
  constructor(){
    super();
    this.initUI();
  }
  initUI():void{
    this.mainElement = createElement('div',{
      className:'de-workbench-taskpanel-container'
    });
    let threeViewPanel = this.createTreeViewPanel();
    threeViewPanel.setOnTaskChangeListener((itemId:string) => {
      console.log("selected task: ",itemId)
    });

    let taskContentPanel = this.createContentPanel();

    insertElement(this.mainElement,threeViewPanel.element());
    insertElement(this.mainElement,taskContentPanel.element());
  }

  private createContentPanel():TaskViewContentPanel{
    let taskContentPanel = new TaskViewContentPanel();
    return taskContentPanel;
  }

  private createTreeViewPanel():TaskViewSelectorPanel{
    let taskThreeViewContainer = new TaskViewSelectorPanel();
    return taskThreeViewContainer;
  }

  getConfiguration():CordovaTaskConfiguration{
    let taskConfig:CordovaTaskConfiguration = new CordovaTaskConfiguration("Cordova Build","build");
    taskConfig.isRelease=false;
    taskConfig.selectedPlatform = {name:'android'};
    return taskConfig;
  }
}
