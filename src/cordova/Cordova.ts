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
  id:string
  version:string
  platforms:Array<CordovaPlatform>
  variants:Array<string>
  projectSettings?:any
  plugins?:Array<CordovaPlugin>
}


export class Cordova {

  private cordovaUtils: CordovaUtils;
  //private cordovaPluginScanner: CordovaPluginScanner;

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
          let plugin = new CordovaPlugin();
          plugin.name = key;
          plugin.id = pluginRaw["plugin"]["$"]["id"];
          plugin.version = pluginRaw["plugin"]["$"]["version"];
          plugin.description = (pluginRaw["plugin"]["description"] || [])[0];
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
        });
        resolve(plugins);
      });
    });
  }

  /**
   * Add a new plugin to a Cordova project
   **/
  public addPlugin(projectRoot: string, pluginSpec: string, installOpt: any): Promise<string> {
    Logger.getInstance().info("addPlugin ", projectRoot, pluginSpec, installOpt)
    let executor = new CordovaExecutor(projectRoot);
    var args = ["plugin", "add", pluginSpec];
    installOpt = installOpt || {};
    if (installOpt.searchPath) {
      args[args.length] = '--searchpath';
      args[args.length] = installOpt.searchPath;
    }
    var that = this;
    return new Promise((resolve, reject) => {
      executor.runSpawn("cordova", args, "Plugin_Add", false).then((res) => {
        console.log("Plugin_Add result:", res);
        resolve.bind(that)(res);
      }, (err) => {
        console.error(err);
        reject(err);
      });
    });
  }

  /**
   * Remove a plugin from a Cordova project
   **/
  public removePlugin(projectRoot: string, pluginSpec: string): Promise<string> {
    Logger.getInstance().info("removePlugin ", projectRoot, pluginSpec)
    let executor = new CordovaExecutor(projectRoot);
    var args = ["plugin", "remove", "--save", pluginSpec];
    return new Promise((resolve, reject) => {
      executor.runSpawn("cordova", args, "Plugin_Remve", false).then((res) => {
        console.log("Plugin_Add result:", res);
        resolve(res);
      }, (err) => {
        console.error(err);
        reject(err);
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

  /**
   * Runs build command fot the given Cordova project
   */
  public buildProject(projectRoot: string, platform:string, options:any): Promise<any> {
    Logger.getInstance().debug("buildProject: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.runBuild(projectRoot, platform, options);
  }

  /**
   * Clean the given Cordova project
   */
  public cleanProject(projectRoot: string, platform:string): Promise<any> {
    Logger.getInstance().debug("cleanProject: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.runClean(projectRoot, platform);
  }

  /**
   * Prepare the given Cordova project
   */
  public prepareProject(projectRoot: string, platform:string): Promise<any> {
    Logger.getInstance().debug("prepareProject: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.runPrepare(projectRoot, platform);
  }

  public prepareProjectWithBrowserPatch(projectRoot: string): Promise<any> {
    Logger.getInstance().debug("prepareProject: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.runPrepareWithBrowserPatch(projectRoot);
  }

  public runProject(projectRoot:string,platform:string,target:string,options:any): Promise<any> {
    Logger.getInstance().debug("runProject: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.runProject(projectRoot, platform, target, options);
  }

  public getProjectInfoSync(projectRoot:string):any {
    let jsonPath = path.join(projectRoot, "package.json");
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

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

  public async getCordovaProjectInfo(projectRoot:string,loadPlugins?:boolean):Promise<CordovaProjectInfo>{
    let json = await this.getProjectInfo(projectRoot);
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
      id:json.name,
      version:json.version,
      path:projectRoot,
      platforms:cordovaPlatforms,
      plugins:cordovaPlugins,
      variants:[]
    };
  }




}
