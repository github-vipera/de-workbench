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
  public version: string;
  public virtualRun: boolean;
}

export class CordovaPlugin {
  public name: string;
  public id: string;
  public version: string;
  public description: string;
  public isTopLevel: boolean;
  public info: any;
}

export class Cordova {

  private cordovaUtils: CordovaUtils;
  private cordovaPluginScanner: CordovaPluginScanner;

  constructor() {
    Logger.getInstance().debug("Creating Cordova...");
    this.cordovaUtils = new CordovaUtils();
    this.cordovaPluginScanner = new CordovaPluginScanner();
  }

  /**
   * Returns a list of installed platforms for a Cordova Project
   */
  getInstalledPlatforms(projectRoot: string): Promise<Array<CordovaPlatform>> {
    return new Promise((resolve, reject) => {
      let ret = this.getInstalledPlatformsSync(projectRoot);
      resolve(ret);
    });
  }

  /**
   * Returns a list of installed platforms for a Cordova Project in a sync way
   */
  getInstalledPlatformsSync(projectRoot: string): Array<CordovaPlatform> {
    let ret: any = this.cordovaUtils.getInstalledPlatforms(projectRoot);
    return ret.installed;
  }

  /**
   * Returns a list of installed plugins for a Cordova Project
   */
  getInstalledPlugins(projectRoot: string): Promise<Array<CordovaPlugin>> {
    Logger.getInstance().debug("getInstalledPlugins called...");
    return new Promise((resolve, reject) => {
      let that = this;
      this.cordovaPluginScanner.scan(projectRoot, function(results) {
        let pluginsRaw = that.cordovaPluginScanner.getInstalledPlugin();
        let plugins = new Array();
        Object.keys(results.plugins).forEach((key) => {
          let pluginRaw = pluginsRaw.plugins[key];
          let plugin = new CordovaPlugin();
          plugin.name = key;
          plugin.id = pluginRaw["plugin"]["$"]["id"];
          plugin.version = pluginRaw["plugin"]["$"]["version"];
          plugin.description = pluginRaw["plugin"]["description"][0];
          plugin.isTopLevel = pluginRaw["is_top_level"];
          plugin.info = pluginRaw;
          plugins.push(plugin);
        });
        resolve(plugins);
        //Logger.getInstance().debug("getInstalledPlugins done: ", plugins);
      });
    });
  }

  /**
   * Add a new plugin to a Cordova project
   **/
  addPlugin(projectRoot: string, pluginSpec: string, installOpt: any): Promise<string> {
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
  removePlugin(projectRoot: string, pluginSpec: string): Promise<string> {
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
  getPlatformPath(projectRoot: string, platform: string): string {
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
  createNewProject(projectInfo: any): Promise<any> {
    Logger.getInstance().debug("createNewProject: ", projectInfo)
    let executor = new CordovaExecutor(null);
    return executor.createNewProject(projectInfo);
  }

  /**
   * Creates a new Cordova project with the given parameters
   */
  removeAllPlatforms(projectInfo: any): Promise<any> {
    Logger.getInstance().debug("removeAllPlatforms: ", projectInfo)
    let executor = new CordovaExecutor(null);
    return executor.removeAllPlatforms(projectInfo);
  }

  /**
   * Adds platforms to a project
   */
  addPlatforms(projectInfo): Promise<any>{
    Logger.getInstance().debug("removeAllPlatforms: ", projectInfo)
    let executor = new CordovaExecutor(null);
    return executor.addPlatforms(projectInfo);
  }

  /**
   * Removes platforms from project
   **/
  removePlatforms(projectRoot: string,platformList:Array<String>): Promise<any>{
    Logger.getInstance().debug("removePlatforms: ", projectRoot)
    let executor = new CordovaExecutor(null);
    return executor.removePlatforms(platformList, projectRoot);
  }

  buildProject(projectRoot: string, platform:string, options:any): Promise<any> {
    // TODO!!
    return null;
  }

  cleanProject(projectRoot: string, platform:string, options:any): Promise<any> {
    // TODO!!
    return null;
  }

  prepareProject(projectRoot: string, platform:string, options:any): Promise<any> {
    // TODO!!
    return null;
  }

  runProject(projectRoot: string, platform:string, options:any): Promise<any> {
    // TODO!!
    return null;
  }

}
