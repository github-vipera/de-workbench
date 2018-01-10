'use babel'

/*!
 * CordovaUtils - Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash")
import { Logger } from '../logger/Logger'

export class CordovaUtils {

  private atomProject:any;

  constructor(){
    this.atomProject = atom.project;
  }

  scanDeviceParts(parts:Array<String>){
    var res = new Array();
    for(var i=0; i< parts.length; i++){
      if(parts[i] && !parts[i].endsWith(":")){
        res.push(parts[i].trim());
      }
    }
    return res;
  }

  scanPlatformParts(parts:Array<String>,skipBrowser:boolean){
    var res={
      installed:new Array(),
      available:new Array(),
    }
    var sepCount=0;
    for(var i=0; i<parts.length; i++){
      if(parts[i]){
        if(parts[i].endsWith(":") || parts[i].endsWith(": ")){
          sepCount++;
        }else if(sepCount === 1 && !(skipBrowser && parts[i].indexOf("browser") != -1 )){
          res.installed.push(parts[i].trim());
        }else if(sepCount === 2){
          res.available.push(parts[i].trim());
        }
      }
    }
    return res;
  }

  public parseDeviceList(stringValue){
      if(!stringValue){
        return [];
      }
      var parts=stringValue.split('\n');
      var deviceList=this.scanDeviceParts(parts);
      Logger.consoleLog(deviceList.toString());
      return deviceList;
    }

    parsePlatformList(stringValue){
      if(!stringValue){
        return [];
      }
      var parts=stringValue.split('\n');
      var platforms=this.scanPlatformParts(parts,true);
      return platforms;
    }

    getPlatformValue(item){
      if(!item){
        return undefined;
      }
      return item.split(" ")[0];
    }

    parsePluginList(stringValue){
      Logger.consoleLog("parsePluginList");
      var listParts=stringValue.split("\n");
      var result=new Array();
      _.forEach(listParts,(item)=>{
        result.push(this.parsePluginRecord(item));
      });
      Logger.consoleLog("parsePluginsList results:", result);
      return result;
    }

    parsePluginRecord(record){
      var values=record.split(" ");
      return{
        id: values[0].trim(),
        version: values[1].trim(),
        name: values.slice(2).join(" ").trim()
      };
    }

    public getInstalledPlatforms(rootProjectPath:string){
      if (!rootProjectPath){
        return [];
      }
      let completePath = path.join(rootProjectPath, 'package.json');
      if(!fs.existsSync(completePath)){
        return [];
      }
      var packageJSON = JSON.parse(fs.readFileSync(completePath, 'utf8'));
      if(!packageJSON || !packageJSON.cordova || !packageJSON.cordova.platforms){
        return [];
      }
      let platforms = packageJSON.cordova.platforms;
      let dependencies = packageJSON.dependencies || {};
      let platformsList = new Array();
      console.log("PLATFORMS:",platforms);
      _.forEach(platforms,(key) => {
        var platform = {
            "name": key,
            "version" : "0.0.0",
            "virtualRun" : false
        }
        let pKey = "cordova-" + key;
        let versionStr = dependencies[pKey];
        if(versionStr){
          platform.version = this.parseVersion(versionStr);
        }
        if(platform.name === "browser"){
          platform.virtualRun = true;
        }else{
          platform.virtualRun = false;
        }
        platformsList.push(platform);
      });
      return {
        "installed": platformsList
      }
    }

    /**
     * Returns the assets path for the given platform
     */
    public getPlatformPath(projectRoot: string, platform: string): string {
      Logger.getInstance().debug("getPlatformPath ", projectRoot, platform)
      if (platform === "android") {
        return path.resolve(this.getAndroidPlatformPath(projectRoot),"assets");
      } else if (platform === "ios") {
        return path.resolve(projectRoot,"platforms","ios");
      } else if(platform === 'browser'){
        return path.resolve(projectRoot,"platforms","browser");
      }else {
        console.error("getPlatformPath with unknown platform:" + platform);
        return undefined;
      }
    }

    public getPlatformAssetsPath(projectRoot:string,platform: string):string{
      return path.resolve(this.getPlatformPath(projectRoot,platform),"www");
    }


    public getAndroidPlatformPath(projectRoot:string):string{
      let completePath = path.join(projectRoot, 'package.json');
      if(!fs.existsSync(completePath)){
        throw new Error("package.json not found");
      }
      let packageJSON = JSON.parse(fs.readFileSync(completePath, 'utf8'));
      let dependencies = packageJSON.dependencies || {};
      let pKey = "cordova-android";
      let versionStr = dependencies[pKey];
      if(versionStr){
        let version = this.parseVersion(versionStr);
        let versionParts = version.split("\.");
        if(versionParts && versionParts[0] && parseInt(versionParts[0])>= 7){
          return path.join('platforms', 'android','app','src','main');
        }
      }
      return path.resolve(projectRoot,"platforms","android");
    }



    isCordovaProject(rootProjectPath):boolean {
      return false; //TODO!!
    }

    public parseVersion(versionStr:string):string{
      return versionStr.replace(/^[^0-9]+/, '');
    }
}
