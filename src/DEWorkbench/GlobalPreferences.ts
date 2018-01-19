'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

'use babel'

import { EventEmitter }  from 'events'
import { Logger } from '../logger/Logger'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const fs = require('fs')
const path = require('path')

const _ = require('lodash');

var JsonDB = require('node-json-db');

export class GlobalPreferences {

  private static _instance:GlobalPreferences;
  private _db:any;

  private constructor(){
    this.ensureFolder(GlobalPreferences.preferencesFolder)
    let prefsFile = path.join(GlobalPreferences.preferencesFolder,'de_workbench_preferences.json');
    this._db = new JsonDB(prefsFile, true, true);
    Logger.consoleLog("Global Preferences:" , prefsFile)
  }

  private ensureFolder(folder){
    if (!fs.existsSync(folder)){
      fs.mkdirSync(folder);
    }
  }

  private saveTimestamp(){
    this.save("last_access", new Date().toString() )
  }

  public static get preferencesFolder():string {
    return path.join(GlobalPreferences.userHome, ".de_workbench")
  }

  protected static get userHome():string {
    return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
  }

  public static getInstance():GlobalPreferences{
    if (!this._instance){
      this._instance = new GlobalPreferences();
    }
    return this._instance;
  }

  public get(key:string){
    try {
      return this._db.getData(key);
    } catch(error) {
        return null;
    };
  }

  public save(key:string, value:any){
    this._db.push(key, value);
  }

  public delete(key:string){
    this._db.delete(key)
  }

}
