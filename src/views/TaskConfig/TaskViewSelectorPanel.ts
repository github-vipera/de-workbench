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
import { CordovaTaskConfiguration, CordovaTask } from '../../cordova/CordovaTasks'
import { UITreeViewModel, UITreeItem, UITreeView,UITreeViewSelectListener,findItemInTreeModel } from '../../ui-components/UITreeView'
import { map, filter, reject, find } from 'lodash'
import { EventEmitter }  from 'events'
import { Logger } from  '../../logger/Logger'
const StringHash = require('string-hash')

export class TaskViewSelectorPanel extends UIBaseComponent implements UITreeViewSelectListener{
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
      return  { id: StringHash(item.name), name: item.name};
    });
    return { id: 'custom', name: 'Custom', icon: null,
      expanded:true,
      children:children
    };
  }

  createCdvTaskNode(cvdTask:Array<CordovaTaskConfiguration>):UITreeItem{
    let children = map<CordovaTaskConfiguration,UITreeItem>(cvdTask,(item:CordovaTaskConfiguration) => {
      return  { id: StringHash(item.name), name: item.displayName};
    });
    return { id: 'default', name: 'Cordova', icon: null,
      expanded : true,
      children: children
    };
  }

  onItemSelected(itemId:string,item:UITreeItem){
    Logger.consoleLog("selected: ",itemId,item);
    if(this.taskSelectionListener){
      this.taskSelectionListener(this.translateItemIdToTaskId(itemId));
    }
  }

  setSelected(itemId:string,value:boolean):void{
    this.treeView.selectItemById(StringHash(itemId),value);
  }

  setOnTaskChangeListener(callback: (itemId:string) => void):void{
    this.taskSelectionListener = callback;
  }

  translateItemIdToTaskId(itemId:string):string {
    let task:CordovaTaskConfiguration = find(this.cdvTasks,(item) => {
      return itemId == StringHash(item.name);
    });
    if(task){
      return task.name;
    }
    return itemId;
  }

}
