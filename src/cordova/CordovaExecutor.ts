'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const kill = require('tree-kill');
const fse = require('fs-extra');
const _ = require("lodash");
import { CommandExecutor } from '../utils/CommandExecutor';
import { Logger } from '../logger/Logger'
import { CordovaUtils } from './CordovaUtils'

export class CordovaExecutor extends CommandExecutor {

  constructor(path: string) {
    super(path);
  }

  /**
   * Creates a new Cordova project with the given parameters
   */
  public createNewProject(projectInfo: any): Promise<any> {
    Logger.getInstance().info("Creating new Cordova project with for ", projectInfo);
    var cmd = "";
    var args = [];
    var options = this.getCmdOptions();
    var execNpmInstall = false;
    if (projectInfo.type === 'ionic1') {
      cmd = "ionic"
      var newPath = projectInfo.basePath;
      options = this.getCmdOptions(newPath);
      args = ["start", projectInfo.name, projectInfo.template, "--type", "ionic1", "--skip-link"];
    }
    else if (projectInfo.type === 'ionic2') {
      cmd = "ionic"
      var newPath = projectInfo.basePath;
      options = this.getCmdOptions(newPath);
      args = ["start", projectInfo.name, projectInfo.template, "--skip-link"];
      execNpmInstall = false;
    } else {
      //by default is cordova (projectInfo.type==='cordova')
      cmd = "cordova"
      args = ["create", projectInfo.path, projectInfo.packageId, projectInfo.name];
    }
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve, reject) => {
      this.spawnRef.stdout.on('data', (data) => {
        Logger.getInstance().debug(`[Creating Project  ${projectInfo.name}]: ${data}`)
        console.log(`[Build  ${projectInfo.name}]: ${data}`);
      });
      this.spawnRef.stderr.on('data', (data) => {
        Logger.getInstance().error("[scriptTools] " + data.toString())
        console.error(`[Creating Project  ${projectInfo.name}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
        console.log(`[Creating Project  ${projectInfo.name}] child process exited with code ${code}`);
        Logger.getInstance().info(`[Creating Project  ${projectInfo.name}] child process exited with code ${code}`)
        this.spawnRef = undefined;
        if (code === 0) {
          this.removeAllPlatforms(projectInfo).then((res) => {
            this.addPlatforms(projectInfo).then((res) => {
              if (!execNpmInstall) {
                resolve("Creation done");
              } else {
                Logger.getInstance().info("This project requires npm install...");
                this.execNpmInstall(projectInfo.path).then(resolve, reject);
              }
            }, (err) => {
              reject("Creation Fail");
            })
          }, (err) => {
            reject("Creation Fail");
          })
        } else {
          reject("Creation Fail");
        }
      });
    });
  }

  public removeAllPlatforms(projectInfo: any): Promise<any>{
    Logger.getInstance().info("Removing all platforms for ", projectInfo);
    return new Promise((resolve,reject) => {
      let installedPlatforms = this.getInstalledPlatforms(projectInfo.path);
      if(installedPlatforms && installedPlatforms.installed && installedPlatforms.installed.length > 0 && installedPlatforms.installed[0]){
        Logger.getInstance().info("Detected installed platform,",JSON.stringify(installedPlatforms.installed));
        this.removePlatforms(installedPlatforms.installed,projectInfo.path).then(resolve,reject);
      }else {
        resolve();
      }
    });
  }

  public addPlatforms(projectInfo): Promise<any>{
    Logger.getInstance().info("Adding platforms for ", projectInfo);
    var cmd="cordova"
    var args = ["platform","add","--save"];
    var platformsStr = "";
    _.forEach(projectInfo.platforms,(platform) => {
      args[args.length] = platform;
      platformsStr += " " + platform;
    });
    var options={
        cwd: projectInfo.path,
        detached:false
    };
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve,reject) => {
      this.spawnRef.stdout.on('data', (data) => {
          Logger.getInstance().debug(`[Adding platform  [${platformsStr}] to  ${projectInfo.name}]: ${data}`)
          console.log(`[Adding platforms  [${platformsStr}] to  ${projectInfo.name}]: ${data}`);
      });
      this.spawnRef.stderr.on('data', (data) => {
          Logger.getInstance().error("[scriptTools] " + data.toString())
          console.error(`[Adding platform  [${platformsStr}] to  ${projectInfo.name}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
          console.log(`[Adding Platform [${platformsStr}] to ${projectInfo.name}] child process exited with code ${code}`);
          Logger.getInstance().info(`[Adding Platform [${platformsStr}] to ${projectInfo.name}] child process exited with code ${code}`)
          this.spawnRef = undefined;
          if(code === 0){
            resolve("Add Platform done");
          }else{
            reject("Add Platform Fail");
          }
      });
    });
  }

  public execNpmInstall(path:string){
    Logger.getInstance().info("execNpmInstall for: ", path)
    var cmd="npm"
    var args = ["install"];
    var options=this.getCmdOptions(path);
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve,reject) => {
      this.spawnRef.stdout.on('data', (data) => {
          Logger.getInstance().debug(`[npm install]: ${data}`)
          console.log(`[npm install]: ${data}`);
      });
      this.spawnRef.stderr.on('data', (data) => {
          Logger.getInstance().error("[npm install] " + data.toString())
          console.error(`[npm install]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
          console.log(`[npm install] child process exited with code ${code}`);
          Logger.getInstance().info(`[npm install] child process exited with code ${code}`)
          this.spawnRef = undefined;
          if(code === 0){
            resolve("npm install done");
          }else{
            reject("npm install Fail");
          }
      });
    });
  }

  public removePlatforms(platformList,path:string){
    _.forEach(platformList,(item,index)=>{
      platformList[index]=item.name;
    })
    console.log("Executing remove-platform for ",platformList);
    var cmd="cordova"
    var args = ["platform","remove","--save"].concat(platformList);
    var options=this.getCmdOptions(path);
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve,reject) => {
      this.spawnRef.stdout.on('data', (data) => {
          Logger.getInstance().debug(`[Remove-platform  ${platformList}]: ${data}`)
          console.log(`[Remove-platform  ${platformList}]: ${data}`);
      });

      this.spawnRef.stderr.on('data', (data) => {
          Logger.getInstance().error("[Remove-platform] " + data.toString())
          console.error(`[Remove-platform  ${platformList}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
          console.log(`[Remove-platform  ${platformList}] child process exited with code ${code}`);
          Logger.getInstance().info(`[Remove-platform  ${platformList}] child process exited with code ${code}`)
          this.spawnRef = undefined;
          if(code === 0){
            resolve("Remove-platform Done");
          }else{
            reject("Remove-platform Fail");
          }
      });
    });
  }

  getInstalledPlatforms(rootProjectPath:string):any{
    return new CordovaUtils().getInstalledPlatforms(rootProjectPath);
  }

}
