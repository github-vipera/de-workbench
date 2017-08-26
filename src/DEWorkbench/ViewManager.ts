
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

const md5 = require("md5")
const $ = require("jquery")

export class ViewManager {

  constructor(){
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
    return null;
  }

  public static get VIEW_SERVERS():ViewInfo { return {id:"servers",title:"Servers",uri:ViewManager.buildURI("servers"),location:"left",activatePane:true,searchAllPanes:true} }
  public static get VIEW_BOOKMARKS():ViewInfo { return {id:"bookmarks",title:"Bookmarks",uri:ViewManager.buildURI("bookmarks"),location:"bottom",activatePane:true,searchAllPanes:true} }
  public static VIEW_PUSHTOOLS(projectRoot:string):ViewInfo { return {id:"pushTool",title:"Push Tool",uri:ViewManager.buildURI("pushTool",projectRoot),location:"center",activatePane:true,searchAllPanes:true, userData: { projectRoot:projectRoot }} }
  public static VIEW_SERVER_INSTANCE(serverInstance:any):ViewInfo { return {id:"serverInstance_" + serverInstance.instanceId,title:"Server ["+ serverInstance.name +"]",uri:ViewManager.buildURI("serverInstance",serverInstance.instanceId),location:"center",activatePane:true,searchAllPanes:true, userData: { serverInstance:serverInstance }} }
  public static VIEW_PROJECT_SETTINGS(projectRoot:string):ViewInfo { return {id:"projectSettings",title:"Project Settings",uri:ViewManager.buildURI("projectSettings",projectRoot),location:"center",activatePane:true,searchAllPanes:true, userData: { projectRoot:projectRoot }} }

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

}

export interface ViewInfo {
  id:string,
  title:string,
  uri:string,
  location:string,
  activatePane:boolean,
  searchAllPanes:boolean,
  userData?:any
}
