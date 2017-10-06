'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */



export class UINotifications {

  public static showInfo(message:string, options?:any):any{
    return atom.notifications.addInfo(message, options)
  }

  public static showError(message:string, options?:any):any{
    return atom.notifications.addError(message, options)
  }

  public static showSuccess(message:string, options?:any):any{
    return atom.notifications.addSuccess(message, options)
  }

}
