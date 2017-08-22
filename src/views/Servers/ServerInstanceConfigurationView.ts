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

import { EventEmitter }  from 'events'
import { UIPane } from '../../ui-components/UIPane'
import { ServerManager, ServerProvider, ServerInstanceWrapper, ServerInstance,ServerInstanceConfigurator } from  '../../DEWorkbench/services/ServerManager'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { Logger } from '../../logger/Logger'
import { UITreeItem, UITreeViewModel, UITreeViewSelectListener, UITreeView, findItemInTreeModel } from '../../ui-components/UITreeView'
const StringHash = require('string-hash')
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { UILoggerComponent,LogLine,IFilterableModel } from '../../ui-components/UILoggerComponent'

const _ = require('lodash')

export class ServerInstanceConfigurationView extends UIPane {

  _serverInstance:ServerInstanceWrapper;
  _configCtrl : ServerInstanceConfigurationCtrl;

  constructor(serverInstance:ServerInstanceWrapper){
    super({
      title: "Server[" + serverInstance.name +"]",
      projectRoot: "__",
      paneName : "DEServerConfig_" + serverInstance.instanceId,
      location : 'center',
      userData : {
        serverInstance : serverInstance
      }
    })
    Logger.getInstance().debug("ServerInstanceConfigurationView creating for ",this.projectRoot, this.projectId);
  }

  protected createUI():HTMLElement {
    this._serverInstance = this.options.userData.serverInstance;

    this._configCtrl = new  ServerInstanceConfigurationCtrl(this._serverInstance)

    let mainContainer = createElement('div',{
      elements : [ this._configCtrl.element() ],
      className: 'de-workbench-server-config-pane'
    })


    return mainContainer;
  }

}


class UIExtComponent extends UIBaseComponent {

  private _events:EventEmitter;

  constructor(){
    super();
    this._events = new EventEmitter()
  }

  protected fireEvent(event, ...params){
    this._events.emit(event, params)
  }

  public addEventListener(event:string, listener){
      this._events.addListener(event,listener)
  }

  public removeEventListener(event:string, listener){
      this._events.removeListener(event,listener)
  }

  public destroy(){
    this._events.removeAllListeners();
    this._events = null;
    super.destroy()
  }

}


class ServerInstanceConfigurationCtrl extends UIBaseComponent {

  _serverInstance:ServerInstanceWrapper;
  _headerCtrl:HeaderCtrl;
  _tabbedView: UITabbedView;
  _logCtrl: ServerLogView;
  _confCtrl : ConfigContainerControl;

  constructor(serverInstance:ServerInstanceWrapper){
    super();
    this._serverInstance = serverInstance;
    this.initUI();
  }

  protected initUI(){
    this._headerCtrl = new HeaderCtrl(this._serverInstance)
    this._headerCtrl.addEventListener('didActionClick',(action)=>{
      alert("action:" + action)
    })

    this._logCtrl = new ServerLogView(this._serverInstance);
    this._confCtrl = new ConfigContainerControl(this._serverInstance);
    this._confCtrl.addEventListener('didConfigurationChange',(evt)=>{
      console.log("TODO enable Save button and Revert Changes!")
    })

    this._tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
    this._tabbedView.element().classList.add('de-workbench-server-config-tabbedview')
    this._tabbedView.addView(new UITabbedViewItem('log',       'Log',  this._logCtrl.element() ));
    this._tabbedView.addView(new UITabbedViewItem('configuration',   'Configuration',  this._confCtrl.element()));

    this.mainElement = createElement('div',{
      elements : [ this._headerCtrl.element(), this._tabbedView.element() ],
      className: 'de-workbench-server-config-maincontainer'
    })
  }

  createFooView():HTMLElement {
      return createElement('div',{

      })
  }

  public destroy(){
    super.destroy();
  }
}

class HeaderCtrl extends UIExtComponent {

  public static get ActionStartServerInstance():string { return 'start' }
  public static get ActionStopServerInstance():string { return 'stop' }

  _serverInstance:ServerInstanceWrapper;
  _startInstanceButton:HTMLElement;
  _stopInstanceButton:HTMLElement;

  constructor(serverInstance:ServerInstanceWrapper){
    super();
    this._events = new EventEmitter()
    this._serverInstance = serverInstance;
    this.initUI();
  }

  protected initUI(){

    let serverName = createElement('h2',{
      elements: [ createText(this._serverInstance.name) ],
      className: 'de-workbench-server-config-header-instanceName text-highlight'
    })

    let serverProviderType = createElement('span',{
      elements: [ createText(this._serverInstance.provider) ],
      className: 'de-workbench-server-config-header-providerName text-subtle'
    })


    this._startInstanceButton = createElement('button',{
      elements: [ createText("Start")],
      className: 'btn btn-xs icon icon-playback-play'
    })
    atom["tooltips"].add(this._startInstanceButton, {title:'Start this Server instance'})
    this._startInstanceButton.addEventListener('click',()=>{
      this.fireEvent('didActionClick', HeaderCtrl.ActionStartServerInstance)
    })

    this._stopInstanceButton = createElement('button',{
      elements: [ createText("Stop")],
      className: 'btn btn-xs icon icon-primitive-square'
    })
    atom["tooltips"].add(this._stopInstanceButton, {title:'Stop this Server instance'})
    this._stopInstanceButton.addEventListener('click',()=>{
      this.fireEvent('didActionClick', HeaderCtrl.ActionStopServerInstance)
    })
    let tabbedToolbar = createElement('div',{
      elements: [
        createElement('div', {
          elements: [this._startInstanceButton, this._stopInstanceButton],
          className: 'btn-group'
        })
      ], className: 'btn-toolbar de-workbench-server-config-header-toolbar'
    });


    let status = createElement('span',{
      elements: [ createText("Running") ],
      className: 'de-workbench-server-config-header-status highlight-success'
    })

    let subCont = createElement('div',{
      elements: [ serverProviderType, status ],
      className: 'de-workbench-server-config-header-subcont'
    })

    this.mainElement = createElement('div',{
      elements: [ serverName,subCont,tabbedToolbar  ],
      className: 'de-workbench-server-config-header-cont'
    })

  }


  public destroy(){
    super.destroy();
  }

}

class ConfigContainerControl extends UIExtComponent {

  _serverInstance:ServerInstanceWrapper;
  _configPanelElement:HTMLElement;
  _configurator:ServerInstanceConfigurator;

  constructor(serverInstance:ServerInstanceWrapper){
    super();
    this._serverInstance = serverInstance;
    this.initUI();
  }

  protected initUI(){
    this._configurator = this._serverInstance.getConfigurator(this._serverInstance.configuration);
    this._configPanelElement = this._configurator.getConfigurationPane(this._serverInstance.configuration);
    this.mainElement = createElement('div',{
      elements: [ this._configPanelElement ],
      className: 'de-workbench-server-config-confelm-cont'
    })

    //listen for changes
    this._configurator.addEventListener('didConfigurationChange',(evt)=>{
      this.fireConfigChanged()
    })

  }

  protected fireConfigChanged(){
    this.fireEvent("didConfigurationChange", this)
  }


}

class ServerLogView extends UIExtComponent {

  _serverInstance:ServerInstanceWrapper;
  _loggerComponent:UILoggerComponent;

  constructor(serverInstance:ServerInstanceWrapper){
    super();
    this._serverInstance = serverInstance;
    this.initUI();
  }

  protected initUI(){
    this._loggerComponent = new UILoggerComponent(true);
    this.mainElement = createElement('div',{
      elements: [ this._loggerComponent.element() ],
      className: 'de-workbench-server-config-logger-cont'
    })
  }

}
