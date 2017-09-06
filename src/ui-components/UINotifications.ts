'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */


export class UINotifications {

  public static showInfo(message:string, options?:any){
    atom.notifications.addInfo(message, options)
  }

  public static showError(message:string, options?:any){
    atom.notifications.addError(message, options)
  }
}
