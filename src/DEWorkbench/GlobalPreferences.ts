'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

'use babel'

import { EventEmitter }  from 'events'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const trivialdb = require('trivialdb');
const fs = require('fs')
const path = require('path')

const _ = require('lodash');
const GUID = require('guid');

export class GlobalPreferences {

  private static _instance:GlobalPreferences;
  private _db:any;

  private constructor(){
    this._db = trivialdb.db('de_workbench_preferences', { loadFromDisk: true, rootPath: GlobalPreferences.preferencesFolder, prettyPrint:true });
    console.log("Global Preferences:" , GlobalPreferences.preferencesFolder)
    this.load().then((prefs)=>{
      prefs.save("last_access", new Date().toString())
    });
  }

  private load():Promise<GlobalPreferences>{
    return new Promise((resolve,reject)=>{
      if(!fs.existsSync(GlobalPreferences.preferencesFolder)){
        this.saveTimestamp()
        resolve(this);
        return;
      }
      this._db.reload().then(()=>{
        this.saveTimestamp()
        resolve(this);
      },reject);
    })
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

  public static getInstance():Promise<GlobalPreferences>{
    if (!this._instance){
      this._instance = new GlobalPreferences();
    }
    return this._instance.load();
  }

  public get(key:string){
    return this._db.get(key);
  }

  public save(key:string, value:any){
    return this._db.save(key, value);
  }


}
