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
const path = require("path");
import { CommandExecutor } from '../utils/CommandExecutor';
import { Logger } from '../logger/Logger'
import { CordovaUtils } from './CordovaUtils'

export const DEVICE_AUTO_DEF ="[AUTO]"

export class CordovaExecutor extends CommandExecutor {

  constructor(projectRoot: string) {
    super(projectRoot);
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
    if (!projectInfo.path){
      projectInfo.path = path.join(projectInfo.basePath ,  projectInfo.name);
    }
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
              reject("Creation Failed ("+err+")");
            })
          }, (err) => {
            reject("Creation Failed ("+err+")");
          })
        } else {
          reject("Creation Failed");
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

  public execNpmInstall(projectRoot:string){
    Logger.getInstance().info("execNpmInstall for: ", projectRoot)
    var cmd="npm"
    var args = ["install"];
    var options=this.getCmdOptions(projectRoot);
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

  public removePlatforms(platformList,projectRoot:string){
    _.forEach(platformList,(item,index)=>{
      platformList[index]=item.name;
    })
    console.log("Executing remove-platform for ",platformList);
    var cmd="cordova"
    var args = ["platform","remove","--save"].concat(platformList);
    var options=this.getCmdOptions(projectRoot);
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

  public getInstalledPlatforms(rootProjectPath:string):any{
    return new CordovaUtils().getInstalledPlatforms(rootProjectPath);
  }

  public runBuild(projectRoot:string,platform:string,cliOptions:any){
    Logger.getInstance().info("Executing build for ",projectRoot, platform,cliOptions);
    this.applyGlobalCliOptions(cliOptions);
    var cmd="cordova"
    var args = ["build",platform];
    _.forEach(cliOptions.flags,(single) => {
      args[args.length] = single;
    });
    var options=this.getCmdOptions(projectRoot);
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve,reject) => {
      this.spawnRef.stdout.on('data', (data) => {
          Logger.getInstance().debug(`[Build  ${platform}]: ${data}`)
          console.log(`[Build  ${platform}]: ${data}`);
      });

      this.spawnRef.stderr.on('data', (data) => {
          Logger.getInstance().error("[scriptTools] " + data.toString())
          console.error(`[Build  ${platform}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
          console.log(`[Build  ${platform}] child process exited with code ${code}`);
          Logger.getInstance().info(`[Build  ${platform}] child process exited with code ${code}`)
          this.spawnRef = undefined;
          if(code === 0){
            resolve("Build done Done");
          }else{
            reject("Build Fail");
          }
      });
    });
  }

  public runClean(projectRoot:string, platform:string){
    Logger.getInstance().info("Executing clean for ", projectRoot, platform);
    var cmd="cordova"
    var args = ["clean"];
    if(platform){
      args[1]=platform;
    }else{
      platform="all";
    }
    var options={
        cwd: projectRoot,
        detached:false
    };
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve,reject) => {
      this.spawnRef.stdout.on('data', (data) => {
          Logger.getInstance().debug(`[Clean  ${platform}]: ${data}`)
          console.log(`[Clean  ${platform}]: ${data}`);
      });

      this.spawnRef.stderr.on('data', (data) => {
          Logger.getInstance().error("[Clean] " + data.toString())
          console.error(`[Clean  ${platform}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
          console.log(`[Clean  ${platform}] child process exited with code ${code}`);
          Logger.getInstance().info(`[Clean  ${platform}] child process exited with code ${code}`)
          this.spawnRef = undefined;
          if(code === 0){
            resolve("Clean Done");
          }else{
            reject("Clean Fail");
          }
      });
    });
  }

  public runPrepare(projectRoot:string, platform:string){
    Logger.getInstance().error("Executing prepare for ", projectRoot, platform);
    return new Promise((resolve,reject) => {
      var cmd = this.createPrepare(platform);
      var options=this.getCmdOptions(projectRoot);
      exec(cmd,options,(error, stdout, stderr) => {
        if(error){
          console.error(error.toString());
          Logger.getInstance().error("Prepare error: ", error);
          reject(error);
          return;
        }
        Logger.getInstance().info("Prepare done for ",projectRoot,platform);
        console.log("exec prepare done");
        resolve();
      });
    });
  }

  public runPrepareWithBrowserPatch(projectRoot:string){
    return new Promise((resolve,reject) => {
      this.runPrepare(projectRoot,"browser").then(() => {
        this.patchExtraBrowserFile(projectRoot);
        resolve();
      },(err) => {
        reject(err);
      });
    });
  }

  private patchExtraBrowserFile(projectRoot:string){
    fse.emptyDirSync(path.join(projectRoot,"/platforms/browser/www/__dedebugger"));
    fse.emptyDirSync(path.join(projectRoot,"/platforms/browser/www/socket.io"));
    fse.copySync(__dirname + "/injectedfiles/DEDebuggerClient.js",projectRoot + "/platforms/browser/www/__dedebugger/DEDebuggerClient.js");
    fse.copySync(__dirname + "/injectedfiles/socket.io.js",projectRoot + "/platforms/browser/www/socket.io/socket.io.js");
  }

  private applyGlobalCliOptions(cliOptions){
    if(cliOptions.envVars){
      _.forEach(cliOptions.envVars,(single) => {
        Logger.getInstance().debug("Set Env variable:",single);
        process.env[single.name] = single.value;
      });
    }
  }

  private createPrepare(platform:string):string{
    let cmd="cordova prepare"
    if(platform){
      cmd += " " + platform;
    }
    return cmd;
  }

  runProject(projectRoot:string,platform:string,target:string,cliOptions:any){
    Logger.getInstance().info("Running project for ", projectRoot, platform,target);
    console.log("Execute run with spawn for " + platform,"and cliOptions",cliOptions);
    this.applyGlobalCliOptions(cliOptions);
    var cmd="cordova"
    var args = ["run",platform];
    if(target && target !== DEVICE_AUTO_DEF ){
      args[2] = "--target=" + target;
    }
    _.forEach(cliOptions.flags,(single) => {
      args[args.length] = single;
    });
    var options={
        cwd: projectRoot,
        detached:false
    };
    cmd = this.prepareCommand(cmd);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve,reject) => {
      this.spawnRef.stdout.on('data', (data) => {
          Logger.getInstance().debug(`[Run  ${platform}]: ${data}`)
          console.log(`[Run  ${platform}]: ${data}`);
      });

      this.spawnRef.stderr.on('data', (data) => {
          Logger.getInstance().error("[Run] " + data.toString())
          console.error(`[Run  ${platform}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
          console.log(`[Run  ${platform}] child process exited with code ${code}`);
          Logger.getInstance().info(`[Run  ${platform}] child process exited with code ${code}`)
          this.spawnRef = undefined;
          if(code === 0){
            resolve("Run done Done");
          }else{
            reject("Run Fail");
          }
      });
    });
  }

  getAllDeviceByPlatform(platform:string):Promise<any>{
    if(platform === "browser"){
      return Promise.resolve([DEVICE_AUTO_DEF]);
    }

    var cmd="cordova run " + platform + " --list";
    var options=this.getCmdOptions();
    return new Promise((resolve,reject) => {
      exec(cmd,options,(error, stdout, stderr) => {
        if(error){
          console.error(error.toString());
          reject(error);
          return;
        }
        console.log("exec getAllDeviceByPlatform done " + stdout);
        var detectedDevice= new CordovaUtils().parseDeviceList(stdout);
        detectedDevice.unshift(DEVICE_AUTO_DEF);
        resolve(detectedDevice);
      });
    });
  }


}
