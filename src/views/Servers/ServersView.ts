'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 import {
   createText,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor
 } from '../../element/index';

import { EventBus } from '../../DEWorkbench/EventBus'
import { EventEmitter }  from 'events'
import { DEWorkbench } from '../../DEWorkbench/DEWorkbench'
import { ViewManager } from '../../DEWorkbench/ViewManager'
import { UIPane } from '../../ui-components/UIPane'
import { ServerManager, ServerProviderWrapper, ServerInstanceWrapper, ServerInstance, ServerStatus } from  '../../DEWorkbench/services/ServerManager'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { Logger } from '../../logger/Logger'
import { UITreeItem, UITreeViewModel, UITreeViewSelectListener, UITreeView, findItemInTreeModel } from '../../ui-components/UITreeView'
import { ServerInstanceConfigurationView } from './ServerInstanceConfigurationView'
import { UINotifications } from '../../ui-components/UINotifications'

const md5 = require('md5')
const _ = require('lodash')

export class ServersView extends UIPane {

  protected treeModel:ServersTreeModel;
  protected treeView:UITreeView;
  protected toolbar:ServersToolbar;

  constructor(params:any){
    super(params);
    console.log("ServersView creating for ",this.paneId);
  }

  protected createUI():HTMLElement {
    this.treeModel = new ServersTreeModel();

    this.treeView = new UITreeView(this.treeModel);
    this.treeView.addEventListener('didItemSelected',(nodeId, nodeItem)=>{
      let nodeType = _.find(nodeItem.attributes, { 'name':'srvNodeType' })
      console.log("Node clicked: ", nodeType)
      this.updateToolbar(nodeType.value)
    })
    this.treeView.addEventListener('didItemDblClick',(nodeId, nodeItem)=>{
      let nodeType = _.find(nodeItem.attributes, { 'name':'srvNodeType' })
      console.log("Node dbl clicked: ", nodeType)
      if (nodeType.value==="serverInstance"){
        let nodeId = this.treeView.getCurrentSelectedItemId();
        let nodeItem = <ServerInstanceItem>this.treeModel.getItemById(nodeId);
        this.doConfigureInstance(nodeItem.serverInstance, false);
      }
    })

    this.toolbar = new ServersToolbar();
    this.toolbar.addEventListener('didActionClick', (action)=>{
      this.doToolbarAction(action);
    })

    let el = createElement('div', {
        elements: [
          this.toolbar.element(),
          this.treeView.element()
        ],
        className: 'de-workbench-servers-view'
    });

    EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_NAME_CHANGED, (data)=>{
      this.treeModel.reload();
    })
    EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_REMOVED, (data)=>{
      this.treeModel.reload();
    })

    return el;
  }

  protected updateToolbar(nodeType:string){
      if (nodeType==="root"){
        this.toolbar.enableActions([]);
      } else if (nodeType==="serverProvider"){
        this.toolbar.enableActions([ServersToolbar.ActionNewServerInstance]);
      } else if (nodeType==="serverInstance"){
        this.toolbar.enableActions([ServersToolbar.ActionStartServerInstance, ServersToolbar.ActionStopServerInstance, ServersToolbar.ActionRemoveServerInstance ]);
      }
  }

  protected doToolbarAction(action:string){
    let nodeId = this.treeView.getCurrentSelectedItemId();
    let nodeItem = this.treeModel.getItemById(nodeId);
    this.doToolbarActionForNode(action, nodeItem);
  }

  protected doToolbarActionForNode(action:string, nodeItem:UITreeItem){
    if (action===ServersToolbar.ActionNewServerInstance){
      this.createNewServerInstanceForNode(<ServerProviderItem>nodeItem);
    }
    else if (action===ServersToolbar.ActionRemoveServerInstance){
      this.removeServerInstanceForNode(<ServerInstanceItem>nodeItem);
    }
    else if (action===ServersToolbar.ActionStartServerInstance){
      this.startServerInstanceForNode(<ServerInstanceItem>nodeItem);
    }
    else if (action===ServersToolbar.ActionStopServerInstance){
      this.stopServerInstanceForNode(<ServerInstanceItem>nodeItem);
    }
    else if (action===ServersToolbar.ActionConfigureServerInstance){
      this.configureServerInstanceForNode(<ServerInstanceItem>nodeItem);
    }
  }

  public destroy(){
    this.toolbar.destroy();
    this.treeView.destroy();
    this.treeModel.destroy()
    super.destroy();
  }

  protected createNewServerInstanceForNode(nodeItem:ServerProviderItem){
    if (nodeItem && nodeItem.serverProvider){
      this.createNewServerProviderFor(nodeItem.serverProvider);
    }
  }

  protected removeServerInstanceForNode(nodeItem:ServerInstanceItem){
    if (nodeItem && nodeItem.serverInstance){
      const selected = atom.confirm({
          message: 'Delete Server Instance',
          detailedMessage: 'Do you want to confirm the ' + nodeItem.serverInstance.name +' server instance deletion ?',
          buttons: ['Yes, Delete it', 'Cancel']
        });
        if (selected==0){
          this.removeServerInstance(nodeItem.serverInstance);
        }
    }
  }

  protected startServerInstanceForNode(nodeItem:ServerInstanceItem){
    if (nodeItem && nodeItem.serverInstance && nodeItem.serverInstance.status===ServerStatus.Stopped){
      nodeItem.serverInstance.start();
    }
  }

  protected stopServerInstanceForNode(nodeItem:ServerInstanceItem){
    if (nodeItem && nodeItem.serverInstance && nodeItem.serverInstance.status===ServerStatus.Running){
      nodeItem.serverInstance.stop();
    }
  }

  protected configureServerInstanceForNode(nodeItem:ServerInstanceItem){
    this.doConfigureInstance(nodeItem.serverInstance, false);
  }

  protected createNewServerProviderFor(serverProvider:ServerProviderWrapper){
    let newInstanceName = "New Server";
    let instance = ServerManager.getInstance().createServerInstance(serverProvider.id, newInstanceName, {})
    this.treeModel.reload();
    this.doConfigureInstance(instance, true);
  }

  protected doConfigureInstance(serverInstance:ServerInstanceWrapper, isNew:boolean){
    DEWorkbench.default.viewManager.openView(ViewManager.VIEW_SERVER_INSTANCE(serverInstance), { isNew: isNew })
  }

  protected removeServerInstance(serverInstance:ServerInstanceWrapper){
      ServerManager.getInstance().removeServerInstance(serverInstance)
  }

}

class ServersToolbar extends UIBaseComponent {

  public static get ActionNewServerInstance():string { return 'newInstance '}
  public static get ActionRemoveServerInstance():string { return 'removeInstance '}
  public static get ActionStartServerInstance():string { return 'start '}
  public static get ActionStopServerInstance():string { return 'stop '}
  public static get ActionConfigureServerInstance():string { return 'configure '}

  protected events:EventEmitter;
  protected addInstanceButton:HTMLElement;
  protected removeInstanceButton:HTMLElement;
  protected startInstanceButton:HTMLElement;
  protected stopInstanceButton:HTMLElement;
  protected configureInstanceButton:HTMLElement;

  constructor(){
    super();
    this.events  = new EventEmitter();
    this.initUI();
  }

  protected initUI(){

    // tabbed toolbar
    this.addInstanceButton = createElement('button',{
      className: 'btn btn-xs icon icon-gist-new'
    })
    atom["tooltips"].add(this.addInstanceButton, {title:'Create new Server instance'})
    this.addInstanceButton.addEventListener('click', (evt)=>{
      this.events.emit('didActionClick', ServersToolbar.ActionNewServerInstance)
    })

    this.removeInstanceButton = createElement('button',{
      //elements : [ createText("Delete")],
      className: 'btn btn-xs icon icon-dash'
    })
    atom["tooltips"].add(this.removeInstanceButton, {title:'Delete selected Server instance'})
    this.removeInstanceButton.addEventListener('click',()=>{
      this.events.emit('didActionClick', ServersToolbar.ActionRemoveServerInstance)
    })

    this.startInstanceButton = createElement('button',{
      //elements : [ createText("Rename")],
      className: 'btn btn-xs icon icon-playback-play'
    })
    atom["tooltips"].add(this.startInstanceButton, {title:'Start selected Server instance'})
    this.startInstanceButton.addEventListener('click',()=>{
      this.events.emit('didActionClick', ServersToolbar.ActionStartServerInstance)
    })

    this.stopInstanceButton = createElement('button',{
      className: 'btn btn-xs icon icon-primitive-square'
    })
    atom["tooltips"].add(this.stopInstanceButton, {title:'Stop selected Server instance'})
    this.stopInstanceButton.addEventListener('click',()=>{
      this.events.emit('didActionClick', ServersToolbar.ActionStopServerInstance)
    })

    this.configureInstanceButton = createElement('button',{
      className: 'btn btn-xs icon icon-gear'
    })
    atom["tooltips"].add(this.configureInstanceButton, {title:'Configure selected Server instance'})
    this.configureInstanceButton.addEventListener('click',()=>{
      this.events.emit('didActionClick', ServersToolbar.ActionConfigureServerInstance)
    })

    let tabbedToolbar = createElement('div',{
      elements: [
        createElement('div', {
          elements: [this.addInstanceButton, this.removeInstanceButton, this.startInstanceButton, this.stopInstanceButton, this.configureInstanceButton],
          className: 'btn-group'
        })
      ], className: 'btn-toolbar'
    });
    tabbedToolbar.style.float = "right"
    // end tabbed toolbar

    let toolbarContainer = createElement('div',{
      elements: [ tabbedToolbar ],
      className: 'de-workbench-servers-toolbar-container'
    })

    this.disableAllActions()

    this.mainElement = toolbarContainer
  }

  public addEventListener(event:string, listener){
    this.events.addListener(event, listener)
  }

  public removeEventListener(event:string, listener){
    this.events.removeListener(event, listener)
  }

  public destroy(){
    super.destroy();
    this.events.removeAllListeners();
    this.events = null;
  }

  public enableActions(actions:Array<string>){
    this.disableAllActions();
    for (var i=0;i<actions.length;i++){
      this.enableButton(this.buttoForAction(actions[i]))
    }
  }

  protected buttoForAction(action:string):HTMLElement{
    if (action===ServersToolbar.ActionNewServerInstance){
      return this.addInstanceButton;
    } else if (action===ServersToolbar.ActionRemoveServerInstance){
      return this.removeInstanceButton;
    } else if (action===ServersToolbar.ActionStartServerInstance){
      return this.startInstanceButton;
    } else if (action===ServersToolbar.ActionStopServerInstance){
      return this.stopInstanceButton;
    }
  }

  protected disableAllActions(){
    this.disableButton(this.addInstanceButton);
    this.disableButton(this.removeInstanceButton);
    this.disableButton(this.startInstanceButton);
    this.disableButton(this.stopInstanceButton);
  }

  protected disableButton(button:HTMLElement){
    button.setAttribute('disabled','')
  }

  protected enableButton(button:HTMLElement){
    button.removeAttribute('disabled')
  }

}

class ServersTreeModel implements UITreeViewModel {

  protected events:EventEmitter;

  constructor(){
      this.events = new EventEmitter();
      this.reload();
  }

  public reload(){
    let providers = ServerManager.getInstance().getProviders();
    let providerItems = new Array<ServerProviderItem>();
    for (var i=0;i<providers.length;i++){
      let providerItem = new ServerProviderItem(providers[i], this)
      providerItems.push(providerItem)
    }

    this.root = new ServerRootItem();
    this.root.children = providerItems

    this.events.emit("didModelChanged");
  }

  root:UITreeItem;

  //className?:string;

  getItemById(id:string):UITreeItem {
    return findItemInTreeModel(id, this)
  }

  addEventListener(event:string, listener){
    this.events.addListener(event, listener)
  }

  removeEventListener(event:string, listener){
    this.events.removeListener(event, listener)
  }

  destroy() {
    this.events.removeAllListeners()
    this.events = null;
  }

  public onItemChanged(item:UITreeItem){
    this.events.emit("didModelChanged");
  }

}

class ServerRootItem implements UITreeItem {

  id:string="___servers";
  name:string="Servers";
  className:string="de-workbench-servers-treeview-root-item";
  icon:string="icon-globe";
  expanded:boolean=true;
  //htmlElement?:HTMLElement;
  children:Array<UITreeItem>;
  //selected?:boolean;

  attributes = [{
    name: 'srvNodeType',
    value:'root'
  }];

}

class ServerProviderItem implements UITreeItem {

  serverProvider:ServerProviderWrapper;
  id:string;
  name:string;
  className:string="de-workbench-servers-treeview-provider-item";
  icon:string="icon-database";
  expanded:boolean=true;
  children?:Array<UITreeItem>;
  listener:any;

  attributes = [{
    name: 'srvNodeType',
    value:'serverProvider'
  }];


  constructor(serverProvider:ServerProviderWrapper, listener){
      this.listener = listener
      this.serverProvider = serverProvider;
      this.name = this.serverProvider.getProviderName();
      this.id = this.toIdFromName(this.name);
      this.expanded = true;
      this.children = [];
      let instances = ServerManager.getInstance().getInstancesForProvider(this.serverProvider.getProviderName())
      for (var i=0;i<instances.length;i++){
        this.children.push( new ServerInstanceItem(instances[i], this) )
      }
      console.log(this.children.length)
  }

  protected toIdFromName(name:string):string{
    let id = md5(name)
    return id;
  }

  public onItemChanged(item:UITreeItem){
    this.listener.onItemChanged(item)
  }

}

class ServerInstanceItem implements UITreeItem {

  serverInstance:ServerInstanceWrapper;
  id:string;
  name:string;
  className:string="de-workbench-servers-treeview-instance-item";
  icon:string="";
  expanded:boolean=true;
  listener:any;

  public attributes = [{
    name: 'srvNodeType',
    value:'serverInstance'
  }];

  constructor(serverInstance:ServerInstanceWrapper, listener){
      this.listener = listener
      this.serverInstance = serverInstance;
      this.name = this.serverInstance.name;
      this.id = serverInstance.instanceId;
      this.expanded = true;

      EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_STATUS_CHANGED, (eventData)=>{
        let serverInstance:ServerInstanceWrapper = eventData[0];
        // filter events only for this server
        if (serverInstance.instanceId===this.serverInstance.instanceId){
          this.onServerStatusChanged(true);
        }
      })

      this.onServerStatusChanged(false);
  }

  protected onServerStatusChanged(notify:boolean){
    this.className ="de-workbench-servers-treeview-instance-item";

    if (this.serverInstance.status===ServerStatus.Running){
      this.icon = "icon-pulse"
      this.className=this.className + " instance-running";
    }
    else if (this.serverInstance.status===ServerStatus.Stopped){
      this.icon = "icon-primitive-square"
      this.className=this.className + " instance-stopped";
    }
    else if (this.serverInstance.status===ServerStatus.Starting){
      this.icon = "icon-rocket"
      this.className=this.className + " instance-starting";
    }
    else if (this.serverInstance.status===ServerStatus.Stopping){
      this.icon = "icon-primitive-dot"
      this.className=this.className + " instance-stopping";
    }
    if (notify){
      this.listener.onItemChanged(this)
    }
  }

  protected toIdFromName(name:string):string{
    let id = md5(name)
    return id;
  }

}
