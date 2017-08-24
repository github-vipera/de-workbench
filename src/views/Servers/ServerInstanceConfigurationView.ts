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
import { ServerManager, ServerProvider, ServerInstanceWrapper, ServerInstance,ServerInstanceConfigurator, ServerStatus } from  '../../DEWorkbench/services/ServerManager'
import { UIComponent, UIBaseComponent, UIExtComponent } from '../../ui-components/UIComponent'
import { Logger } from '../../logger/Logger'
import { UITreeItem, UITreeViewModel, UITreeViewSelectListener, UITreeView, findItemInTreeModel } from '../../ui-components/UITreeView'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { UILoggerComponent,LogLine,IFilterableModel } from '../../ui-components/UILoggerComponent'
import { UICommonsFactory, FormActionsOptions, FormActionType } from '../../ui-components/UICommonsFactory'
import { UINotifications } from '../../ui-components/UINotifications'
import { UIEditableLabel } from '../../ui-components/UIEditableLabel'
import { EventBus } from '../../DEWorkbench/EventBus'

//const md5 = require('md5')
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

class ServerInstanceConfigurationCtrl extends UIExtComponent {

  _serverInstance:ServerInstanceWrapper;
  _headerCtrl:HeaderCtrl;
  _tabbedView: UITabbedView;
  //_logCtrl: ServerLogView;
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

    //this._logCtrl = new ServerLogView(this._serverInstance);
    this._confCtrl = new ConfigContainerControl(this._serverInstance);
    this._confCtrl.addEventListener('didConfigurationChange',(evt)=>{
      console.log("TODO enable Save button and Revert Changes!")
    })
    this._confCtrl.addEventListener('didSaveChange',(evt)=>{
      console.log("TODO Save Changes!")
    })
    this._confCtrl.addEventListener('didRevertChange',(evt)=>{
      console.log("TODO Revert Changes!")
    })

    this._tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
    this._tabbedView.element().classList.add('de-workbench-server-config-tabbedview')
    //this._tabbedView.addView(new UITabbedViewItem('log',       'Log',  this._logCtrl.element() ));
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
    // get the configurator instance
    this._configurator = this._serverInstance.getConfigurator(this._serverInstance.configuration);
    // set the current configuration
    this._configurator.applyConfiguration(this._serverInstance.configuration)
    // then get the configurator UI
    this._configPanelElement = this._configurator.getConfigurationPane();

    let actionButtonsOpt:FormActionsOptions = {
      cancel : {
        caption : 'Revert Changes'
      },
      commit : {
        caption : 'Save Changes'
      },
      actionListener: (actionType:number)=>{
        if (actionType===FormActionType.Cancel){
          this.revertChanges()
        } else if (actionType===FormActionType.Commit){
          this.saveChanges()
        }
      }
    }
    let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt)

    this.mainElement = createElement('div',{
      elements: [ this._configPanelElement, actionButtonsContainer ],
      className: 'de-workbench-server-config-confelm-cont'
    })

    //listen for changes
    this._configurator.addEventListener('didConfigurationChange',(evt)=>{
      this.fireConfigChanged()
    })

  }

  protected revertChanges(){
    this._configurator.revertChanges();
    this.fireEvent("didRevertChange", this)
  }

  protected saveChanges(){
    let newConfig = this._configurator.getConfiguration()
    //store new config into the global preferences
    ServerManager.getInstance().storeInstanceConfiguration(this._serverInstance.instanceId, newConfig).then(()=>{
      // then apply new config to the instance
      this._serverInstance.configure(newConfig);
      // store on configurator provider
      this._configurator.applyConfiguration(newConfig)
      // fire the event
      this.fireEvent("didSaveChange", this)
      UINotifications.showInfo("Changes saved successfully.")
    }, (err)=>{
      UINotifications.showError("Error saving changes: " + err)
    });
  }

  protected fireConfigChanged(){
    this.fireEvent("didConfigurationChange", this)
  }


}

class HeaderCtrl extends UIExtComponent {

  public static get ActionStartServerInstance():string { return 'start' }
  public static get ActionStopServerInstance():string { return 'stop' }

  _serverInstance:ServerInstanceWrapper;
  _startInstanceButton:HTMLElement;
  _stopInstanceButton:HTMLElement;
  _editableTitle: UIEditableLabel;
  _status:HTMLElement;

  constructor(serverInstance:ServerInstanceWrapper){
    super();
    EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_STATUS_CHANGED, (eventData)=>{
      let serverInstance:ServerInstanceWrapper = eventData[0];
      // filter events only for this server
      if (serverInstance.instanceId===this._serverInstance.instanceId){
        this.onServerStatusChanged(eventData[0]);
      }
    })
    this._serverInstance = serverInstance;
    this.initUI();
  }

  protected initUI(){
    this._editableTitle = new UIEditableLabel({
      caption:this._serverInstance.name,
      className:  'de-workbench-server-config-header-instanceName text-highlight'
    });
    this._editableTitle.addEventListener('didValueChange',(evt)=>{
      let newName = this._editableTitle.getCaption();
      ServerManager.getInstance().changeInstanceName(this._serverInstance.instanceId, newName).then(()=>{
        this.fireEvent("didNameChange", this)
        UINotifications.showInfo("Name changed successfully.")
      },(err)=>{
        UINotifications.showError("Error changing name: " + err)
      })
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
      this._serverInstance.start();
      //this.fireEvent('didActionClick', HeaderCtrl.ActionStartServerInstance)
    })

    this._stopInstanceButton = createElement('button',{
      elements: [ createText("Stop")],
      className: 'btn btn-xs icon icon-primitive-square'
    })
    atom["tooltips"].add(this._stopInstanceButton, {title:'Stop this Server instance'})
    this._stopInstanceButton.addEventListener('click',()=>{
      this._serverInstance.stop();
      //this.fireEvent('didActionClick', HeaderCtrl.ActionStopServerInstance)
    })
    let tabbedToolbar = createElement('div',{
      elements: [
        createElement('div', {
          elements: [this._startInstanceButton, this._stopInstanceButton],
          className: 'btn-group'
        })
      ], className: 'btn-toolbar de-workbench-server-config-header-toolbar'
    });


    this._status = createElement('span',{
      elements: [ createText("Unknown Status") ],
      className: 'de-workbench-server-config-header-status'
    })

    let subCont = createElement('div',{
      elements: [ serverProviderType, this._status ],
      className: 'de-workbench-server-config-header-subcont'
    })

    this.mainElement = createElement('div',{
      elements: [ this._editableTitle.element(),subCont,tabbedToolbar  ],
      className: 'de-workbench-server-config-header-cont'
    })

    this.setStatus(this._serverInstance.status);
  }

  protected onServerStatusChanged(serverInstance:ServerInstanceWrapper){
      this.setStatus(serverInstance.status)
  }

  //highlight-success
  protected setStatus(status:ServerStatus){
    if (status===ServerStatus.Running){
      //highlight-success
      this.cleanStatus();
      this._status.classList.add('highlight-success')
      this._status.innerText = "Running"
    } else if (status===ServerStatus.Stopped){
      //highlight
      this.cleanStatus();
      this._status.classList.add('highlight-error')
      this._status.innerText = "Not Running"
    } else if (status===ServerStatus.Starting){
      this.cleanStatus();
      this._status.classList.add('highlight-warning')
      this._status.innerText = "Starting"
    } else if (status===ServerStatus.Stopping){
      this.cleanStatus();
      this._status.classList.add('highlight-warning')
      this._status.innerText = "Stopping"
    } else {
      this.cleanStatus();
      this._status.classList.add('highlight')
      this._status.innerText = "Unknown Status"
    }
  }

  protected cleanStatus(){
    this._status.classList.remove('highlight')
    this._status.classList.remove('highlight-info')
    this._status.classList.remove('highlight-warning')
    this._status.classList.remove('highlight-success')
    this._status.classList.remove('highlight-error')
  }

  public destroy(){
    super.destroy();
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
