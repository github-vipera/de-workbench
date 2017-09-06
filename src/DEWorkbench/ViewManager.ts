
'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { EventEmitter }  from 'events'
import { UIPane } from '../ui-components/UIPane'

import { ServersView } from '../views/Servers/ServersView'
import { ServerInstanceConfigurationView } from '../views/Servers/ServerInstanceConfigurationView'
import { BookmarksView } from '../views/Bookmarks/BookmarksView'
import { PushToolView } from '../views/PushTool/PushToolView'
import { ProjectSettingsView } from '../views/ProjectSettings/ProjectSettingsView'
import { LoggerView } from '../views/LoggerView'
import { DebugAreaView } from '../views/DebugArea/DebugAreaView'
import { DebugBreakpointsView } from '../views/DebugArea/DebugBreakpointsView'
import { DebugCallStackView } from '../views/DebugArea/DebugCallStackView'
import { DebugVariablesView } from '../views/DebugArea/DebugVariablesView'
import { DebugWatchExpressionsView } from '../views/DebugArea/DebugWatchExpressionsView'

const md5 = require("md5")
const $ = require("jquery")

export class ViewManager {

  private _registeredItems:any={};

  constructor(){
    this._registeredItems = {}
    this.registerOpeners()
  }

  protected registerOpeners(){

    atom.views["addViewProvider"](UIPane, function(uiPane) {
      return uiPane.element;
    });

    atom.workspace.addOpener((uri, params)=>{
      if (uri.startsWith(UIPane.PANE_URI_PREFIX)){
        return this.manageURI(uri, params);
      }
    })

  }


  protected manageURI(uri:string, params:any){
    if (uri===(UIPane.PANE_URI_PREFIX+"servers")){
      return new ServersView(params)
    }
    else if (uri===(UIPane.PANE_URI_PREFIX+"bookmarks")){
      return new BookmarksView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"pushTool")){
      return new PushToolView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"serverInstance")){
      return new ServerInstanceConfigurationView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"projectSettings")){
      return new ProjectSettingsView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"logInspector")){
      return new LoggerView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"debugAreaView")){
      return new DebugAreaView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"debugBreakpointsView")){
      return new DebugBreakpointsView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"debugCallStackView")){
      return new DebugCallStackView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"debugVariablesView")){
      return new DebugVariablesView(params)
    }
    else if (uri.startsWith(UIPane.PANE_URI_PREFIX+"debugWatchExpressionsView")){
      return new DebugWatchExpressionsView(params)
    }

    return null;
  }

  public static get VIEW_SERVERS():ViewInfo { return {id:"servers",title:"Servers",uri:ViewManager.buildURI("servers"),location:"left",activatePane:true,searchAllPanes:true} }
  public static get VIEW_BOOKMARKS():ViewInfo { return {id:"bookmarks",title:"Bookmarks",uri:ViewManager.buildURI("bookmarks"),location:"bottom",activatePane:true,searchAllPanes:true} }
  public static VIEW_PUSHTOOLS(projectRoot:string):ViewInfo { return {id:"pushTool",title:"Push Tool",uri:ViewManager.buildURI("pushTool",projectRoot),location:"center",activatePane:true,searchAllPanes:true, userData: { projectRoot:projectRoot }} }
  public static VIEW_SERVER_INSTANCE(serverInstance:any):ViewInfo { return {id:"serverInstance_" + serverInstance.instanceId,title: serverInstance.name ,uri:ViewManager.buildURI("serverInstance",serverInstance.instanceId),location:"center",activatePane:true,searchAllPanes:true, userData: { serverInstance:serverInstance }} }
  public static VIEW_PROJECT_SETTINGS(projectRoot:string):ViewInfo { return {id:"projectSettings",title:"Project Settings",uri:ViewManager.buildURI("projectSettings",projectRoot),location:"center",activatePane:true,searchAllPanes:true, userData: { projectRoot:projectRoot }} }
  public static get VIEW_LOG_INSPECTOR():ViewInfo { return {id:"logInspector",title:"DE Log Inspector",uri:ViewManager.buildURI("logInspector"),location:"bottom",activatePane:true,searchAllPanes:true,toggleEnable:true} }

  // DEBUG BLOCKS
  public static get VIEW_DEBUG_AREA():ViewInfo { return {id:"debugAreaView",title:"Debug Area",uri:ViewManager.buildURI("debugAreaView"),location:"right",activatePane:true,searchAllPanes:true,toggleEnable:true} }
  public static get VIEW_DEBUG_BREAKPOINTS():ViewInfo { return {id:"debugBreakpointsView",title:"Breakpoints",uri:ViewManager.buildURI("debugBreakpointsView"),location:"right",activatePane:true,searchAllPanes:true,toggleEnable:true} }
  public static get VIEW_DEBUG_CALL_STACK():ViewInfo { return {id:"debugCallStackView",title:"Call Stack",uri:ViewManager.buildURI("debugCallStackView"),location:"right",activatePane:true,searchAllPanes:true,toggleEnable:true} }
  public static get VIEW_DEBUG_VARIABLES():ViewInfo { return {id:"debugVariablesView",title:"Variables",uri:ViewManager.buildURI("debugVariablesView"),location:"right",activatePane:true,searchAllPanes:true,toggleEnable:true} }
  public static get VIEW_DEBUG_WATCH_EXPRESSIONS():ViewInfo { return {id:"debugWatchExpressionsView",title:"Watch Expressions",uri:ViewManager.buildURI("debugWatchExpressionsView"),location:"right",activatePane:true,searchAllPanes:true,toggleEnable:true} }


  public toggleView(viewInfo:ViewInfo){
    let item = this._registeredItems[viewInfo.id];
    if (item){
      atom.workspace["toggle"](item.getURI());
    } else {
      this.openView(viewInfo)
    }
  }

  public openView(viewInfo:ViewInfo, extUserData?:any){
      let item = {
        id:viewInfo.id,
        getTitle: () => viewInfo.title,
        getURI: () => viewInfo.uri,
        location : viewInfo.location,
        activatePane:true,
        searchAllPanes:true,
        userData:viewInfo.userData
      }
      if (extUserData){
        $.extend(item.userData, extUserData)
      }
      if (viewInfo.toggleEnable){
        this.registerItem(item)
      }
      atom.workspace.open(viewInfo.uri,item).then((view)=>{
        if (view["didOpen"]){
          view["didOpen"]()
        }
        console.log("View created: " , view)
      })
  }

  public static buildURI(viewPath:string, extraParam?:string):string {
    let ret = UIPane.PANE_URI_PREFIX+viewPath;
    if (extraParam){
      ret = ret + "/" + md5(extraParam);
    }
    return ret;
  }

  private registerItem(item){
      this._registeredItems[item.id] = item;
  }

}

export interface ViewInfo {
  id:string,
  title:string,
  uri:string,
  location:string,
  activatePane:boolean,
  searchAllPanes:boolean,
  userData?:any,
  toggleEnable?:boolean
}
