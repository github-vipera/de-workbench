'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

// --------------------------------------------------------------------------------
//import CordovaCommandBuilder from './CordovaCommandBuilder';

// --------------------------------------------------------------------------------

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const kill = require('tree-kill');
const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
import { CordovaUtils } from './CordovaUtils';
import { CordovaPluginScanner } from './CordovaPluginScanner';
import { Logger } from '../logger/Logger'
import { CordovaExecutor } from './CordovaExecutor';
import { EventBus } from '../DEWorkbench/EventBus'

export class CordovaPlatform {
  public name: string;
  public version?: string;
  public virtualRun?: boolean;
}

export class CordovaPlugin {
  public name: string;
  public id: string;
  public version: string;
  public description: string;
  public isTopLevel: boolean;
  public info: any;
  public installed: boolean = false;
  public author:string = '';
  public homepage:string = '';
  public license:string = '';
  public repository:string = '';
  public repositoryType:string = '';
  public sourceType:string = '';
  public lastUpdateTime:string = '';
  public rating:number = 0;
  public platforms:Array<string> = [];
}

export interface NewProjectInfo {
  name:string;
  packageId:string;
  basePath:string;
  path:string;
  platforms:Array<string>,
  type:string;
  template:string;
}

export interface CordovaProjectInfo {
  path:string
  name:string
  displayName:string
  description:string
  author:string
  license:string
  version:string
  platforms:Array<CordovaPlatform>
  variants:Array<string>
  projectSettings?:any
  plugins?:Array<CordovaPlugin>
  npmScripts?:Array<string>
}


export class Cordova {

  private cordovaUtils: CordovaUtils;
  //private cordovaPluginScanner: CordovaPluginScanner;
  private sharedExecutor : CordovaExecutor;

  constructor() {
    Logger.getInstance().debug("Creating Cordova...");
    this.cordovaUtils = new CordovaUtils();
  }

  public isCordovaProject(projectRoot:string):Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this.isCordovaProjectSync(projectRoot));
    });
  }

  public isCordovaProjectSync(projectRoot:string):boolean {
    try {
      let ret = this.getInstalledPlatformsSync(projectRoot);
      if (ret && ret.length>0){
        return true;
      } else {
        return false;
      }
    } catch (ex){
      return false;
    }
  }


  /**
   * Returns a list of installed platforms for a Cordova Project
   */
  public getInstalledPlatforms(projectRoot: string): Promise<Array<CordovaPlatform>> {
    return new Promise((resolve, reject) => {
      let ret = this.getInstalledPlatformsSync(projectRoot);
      resolve(ret);
    });
  }

  /**
   * Returns a list of installed platforms for a Cordova Project in a sync way
   */
  public getInstalledPlatformsSync(projectRoot: string): Array<CordovaPlatform> {
    let ret: any = this.cordovaUtils.getInstalledPlatforms(projectRoot);
    return ret.installed;
  }

  public async addPlatform(projectRoot:string, platformName:string){
    Logger.getInstance().debug("addPlatform called for ...", projectRoot, platformName);
    let executor = new CordovaExecutor(null);
    let projectInfo = await this.getProjectInfo(projectRoot, false);
    await executor.addPlatform(projectInfo, platformName);
    EventBus.getInstance().publish(EventBus.EVT_PLATFORM_ADDED, projectRoot, platformName)
  }

  public async removePlatform(projectRoot:string, platformName:string){
    Logger.getInstance().debug("removePlatform called "+platformName +" for ...", projectRoot);
    let executor = new CordovaExecutor(null);
    await executor.removePlatforms([platformName], projectRoot);
    EventBus.getInstance().publish(EventBus.EVT_PLATFORM_REMOVED, projectRoot, platformName)
  }

  public async addPlugin(projectRoot: string,pluginInfo:CordovaPlugin){
    Logger.getInstance().debug("addPlugin called with "+ pluginInfo.name +" for " + projectRoot);
    let executor = new CordovaExecutor(null);
    let projectInfo = await this.getProjectInfo(projectRoot, false);
    await executor.addPlugin(projectInfo, pluginInfo.id, null);
    EventBus.getInstance().publish(EventBus.EVT_PLUGIN_ADDED, projectRoot, pluginInfo)
  }

  public async removePlugin(projectRoot: string,pluginInfo:CordovaPlugin){
    Logger.getInstance().debug("removePlugin called with "+ pluginInfo.name +" for " + projectRoot);
    let executor = new CordovaExecutor(null);
    let projectInfo = await this.getProjectInfo(projectRoot, false);
    await executor.removePlugin(projectInfo, pluginInfo.id);
    EventBus.getInstance().publish(EventBus.EVT_PLUGIN_REMOVED, projectRoot, pluginInfo)
  }

  /**
   * Returns a list of installed plugins for a Cordova Project
   */
  public getInstalledPlugins(projectRoot: string): Promise<Array<CordovaPlugin>> {
    Logger.getInstance().debug("getInstalledPlugins called...");
    return new Promise((resolve, reject) => {
      let that = this;
      let cordovaPluginScanner = new CordovaPluginScanner();
      cordovaPluginScanner.scan(projectRoot, (results)=> {
        let pluginsRaw = cordovaPluginScanner.getInstalledPlugin();
        let plugins = new Array();
        Object.keys(results.plugins).forEach((key) => {
          let pluginRaw = pluginsRaw.plugins[key];
          if (pluginRaw["plugin"] && pluginRaw["plugin"]["$"]){
            let plugin = new CordovaPlugin();
            plugin.name = key;
            plugin.id = pluginRaw["plugin"]["$"]["id"];
            plugin.version = pluginRaw["plugin"]["$"]["version"];
            plugin.description = (pluginRaw["plugin"]["description"] || ["n.a"])[0];
            plugin.isTopLevel = pluginRaw["is_top_level"];
            plugin.installed = true;
            plugin.info = pluginRaw;
            // gets extra info if availables
            if (pluginRaw["packageJson"]){
              if (pluginRaw["packageJson"]["author"]){
                if (pluginRaw["packageJson"]["author"] instanceof Object){
                  if (pluginRaw["packageJson"]["author"]){
                    plugin.author = pluginRaw["packageJson"]["author"]["name"];
                  }
                } else {
                  plugin.author = pluginRaw["packageJson"]["author"];
                }
              }
              if (pluginRaw["packageJson"]["license"]){
                plugin.license = pluginRaw["packageJson"]["license"];
              }
              if (pluginRaw["packageJson"]["repository"] && pluginRaw["packageJson"]["repository"]["url"]){
                plugin.repository = pluginRaw["packageJson"]["repository"]["url"];
              }
              if (pluginRaw["packageJson"]["repository"] && pluginRaw["packageJson"]["repository"]["type"]){
                plugin.repositoryType = pluginRaw["packageJson"]["type"];
              }
              if (pluginRaw["packageJson"]["homepage"]){
                plugin.homepage = pluginRaw["packageJson"]["homepage"];
              }
            }
            if (pluginRaw["source"] && pluginRaw["source"]["type"]){
              plugin.sourceType = pluginRaw["source"]["type"];
            }
            plugins.push(plugin);
          }
        });
        resolve(plugins);
      });
    });
  }

  /**
   * Returns the assets path for the given platform
   */
  public getPlatformPath(projectRoot: string, platform: string): string {
    Logger.getInstance().debug("getPlatformPath ", projectRoot, platform)
    var result = projectRoot;// != undefined ? projectRoot : atom.project["getPaths"]()[0];
    if (platform === "android") {
      return result + "/platforms/android/assets/www";
    } else if (platform === "ios") {
      return result + "/platforms/ios/www";
    } else {
      console.error("getPlatformPath with unknown platform:" + platform);
      return undefined;
    }
  }

  /**
   * Creates a new Cordova project with the given parameters
   */
  public createNewProject(projectInfo: NewProjectInfo): Promise<any> {
    Logger.getInstance().debug("createNewProject: ", projectInfo)
    let executor = new CordovaExecutor(null);
    return executor.createNewProject(projectInfo);
  }

  /**
   * Creates a new Cordova project with the given parameters
   */
  public removeAllPlatforms(projectInfo: any): Promise<any> {
    Logger.getInstance().debug("removeAllPlatforms: ", projectInfo)
    let executor = new CordovaExecutor(null);
    return executor.removeAllPlatforms(projectInfo);
  }

  /**
   * Adds platforms to a project
   */
  public addPlatforms(projectInfo): Promise<any>{
    Logger.getInstance().debug("removeAllPlatforms: ", projectInfo)
    let executor = new CordovaExecutor(null);
    return executor.addPlatforms(projectInfo);
  }

  /**
   * Removes platforms from project
   **/
  public removePlatforms(projectRoot: string,platformList:Array<String>): Promise<any>{
    Logger.getInstance().debug("removePlatforms: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.removePlatforms(platformList, projectRoot);
  }


  private rejectForBusySharedExecutor():Promise<any> {
    return Promise.reject({
      'ERROR_CODE':'EXECUTOR_BUSY',
      'ERROR_MESSAGE':'Executor is busy'
    });
  }

  /**
   * Runs build command fot the given Cordova project
   */
  public buildProject(projectRoot: string, platform:string, options:any): Promise<any> {
    Logger.getInstance().debug("buildProject: ", projectRoot);
    if(this.isBusy()){
      return this.rejectForBusySharedExecutor();
    }
    this.sharedExecutor = new CordovaExecutor(null);
    return this.sharedExecutor.runBuild(projectRoot, platform, options);
  }

  /**
   * Clean the given Cordova project
   */
  public cleanProject(projectRoot: string, platform:string): Promise<any> {
    Logger.getInstance().debug("cleanProject: ", projectRoot)
    if(this.isBusy()){
      return this.rejectForBusySharedExecutor();
    }
    this.sharedExecutor = new CordovaExecutor(null);
    return this.sharedExecutor.runClean(projectRoot, platform);
  }

  public isBusy():boolean{
    return this.sharedExecutor && this.sharedExecutor.isBusy();
  }

  /**
   * Prepare the given Cordova project
   */
  public prepareProject(projectRoot: string, platform:string): Promise<any> {
    Logger.getInstance().debug("prepareProject: ", projectRoot)
    if(this.isBusy()){
      return this.rejectForBusySharedExecutor();
    }
    this.sharedExecutor = new CordovaExecutor(null);
    return this.sharedExecutor.runPrepare(projectRoot, platform);
  }

  public prepareProjectWithBrowserPatch(projectRoot: string): Promise<any> {
    Logger.getInstance().debug("prepareProject: ", projectRoot)
    if(this.isBusy()){
      return this.rejectForBusySharedExecutor();
    }
    this.sharedExecutor = new CordovaExecutor(null);
    return this.sharedExecutor.runPrepareWithBrowserPatch(projectRoot);
  }

  public runProject(projectRoot:string,platform:string,target:string,options:any): Promise<any> {
    Logger.getInstance().debug("runProject: ", projectRoot)
    if(this.isBusy()){
      return this.rejectForBusySharedExecutor();
    }
    this.sharedExecutor = new CordovaExecutor(null);
    return this.sharedExecutor.runProject(projectRoot, platform, target, options);
  }

  public getPackageJson(projectRoot:string):any {
    let jsonPath = path.join(projectRoot, "package.json");
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  public storePackageJson(projectRoot:string, packageJson:Object) {
    let jsonPath = path.join(projectRoot, "package.json");
    fs.writeFileSync(jsonPath, JSON.stringify(packageJson, null, "\t"), 'utf8')
  }

  public stopExecutor(){
    if(this.sharedExecutor){
      this.sharedExecutor.stopSpawn();
    }
  }




  /**
  public getProjectInfo(projectRoot:string):Promise<any> {
    return new Promise((resolve, reject) => {
      let jsonPath = path.join(projectRoot, "package.json");
      var obj;
      fs.readFile(jsonPath, 'utf8', function (err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        resolve(obj);
      });
    })
  }
  **/

  public async getProjectInfo(projectRoot:string,loadPlugins?:boolean):Promise<CordovaProjectInfo>{
    let json = this.getPackageJson(projectRoot);
    if(!json || !json.cordova){
      return null; // is not a cordova project
    }
    let cdv= json.cordova;
    if(!cdv.platforms){
      cdv.platforms = [];
    }
    let cordovaPlatforms:Array<CordovaPlatform> = [];
    cdv.platforms.forEach((single) => {
        cordovaPlatforms.push({name: single});
    });
    let cordovaPlugins:Array<CordovaPlugin> = null;
    if(loadPlugins){
      cordovaPlugins = await this.getInstalledPlugins(projectRoot);
    }
    return {
      name:json.name,
      displayName:json.displayName,
      description:json.description,
      author:json.author,
      license:json.license,
      version:json.version,
      path:projectRoot,
      platforms:cordovaPlatforms,
      npmScripts:json.scripts || [],
      plugins:cordovaPlugins,
      variants:[]
    };
  }


  public async saveProjectInfo(projectRoot:string, projectInfo:CordovaProjectInfo):Promise<any>{
    var packageJson = this.getPackageJson(projectRoot);
    packageJson.name = projectInfo.name;
    packageJson.displayName = projectInfo.displayName;
    packageJson.description = projectInfo.description;
    packageJson.author = projectInfo.author;
    packageJson.license = projectInfo.license;
    packageJson.version = projectInfo.version;
    this.storePackageJson(projectRoot, packageJson)
  }

}
