'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { EventEmitter }  from 'events'
import { Logger } from '../logger/Logger'

const fs = require('fs')


export class DEWBResourceManager {

  public static getResourcePath(resourceName:string):string{
    let packagePath = atom["packages"].getActivePackage('de-workbench').path;
    return packagePath + "/resources/" + resourceName;
  }

  public static getResourceContent(resourceName:string):string{
    let path = DEWBResourceManager.getResourcePath(resourceName);
    return fs.readFileSync(path, "utf-8");
  }

  public static getJSONResource(resourceName:string):Object{
    return JSON.parse(DEWBResourceManager.getResourceContent(resourceName));
  }

}
