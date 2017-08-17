'use babel'
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Cordova , CordovaProjectInfo} from '../cordova/Cordova';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks'
import { PlatformServer, PlatformServerImpl, PlatformServerConfig} from '../services/remote/PlatformServer'
import {TaskUtils} from './TaskUtils'
import {Logger} from '../logger/Logger'
import { ScriptExecutor } from './ScriptExecutor'

export class TaskExecutor{
  private currentTask:CordovaTaskConfiguration;
  private platformServer:PlatformServer = null;
  private scriptExecutor:ScriptExecutor = null;
  private cordova:Cordova
  constructor(){
      this.cordova=ProjectManager.getInstance().cordova;
  }
  public async executeTask(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo):Promise<any>{
    if(this.isBusy()){
      throw new Error("TaskExecutor is busy");
    }
    await this.scheduleNodeScripts(taskConfig,project);
    this.currentTask = taskConfig;
    Logger.getInstance().debug('schedule node tasks');
    try{
      switch(this.currentTask.taskType){
        case "prepare":
            await this.executePrepare(project);
            this.currentTask = null;
        break;
        case "build":
            await this.executeBuild(project);
            this.currentTask = null
        break;
        case "run":
            await this.executeRun(project);
            this.currentTask = null
        case "buildRun":
            await this.executeBuild(project);
            // TODO publish progress
            await this.executeRun(project)
            this.currentTask = null
        break;
      }
    }catch(err){
      this.currentTask = null;
      throw err;
    }
  }
  public async executeTaskChain(taskChain:Array<CordovaTaskConfiguration>,project:CordovaProjectInfo){
    for(let task of taskChain){
      await this.executeTask(task,project);
    }
  }
  isBusy():boolean{
    return this.currentTask != null;
  }
  async executeBuild(project:CordovaProjectInfo){
    let platform= this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    return this.cordova.buildProject(project.path, platform ,{});
  }

  async executeRun(project:CordovaProjectInfo){
    this.startPlatformServer(project);
    let platform = this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    return this.cordova.runProject(project.path, platform ,null,{});
  }

  async executePrepare(project:CordovaProjectInfo){
    let platform = this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    return this.cordova.prepareProject(project.path,platform);
  }

  private async startPlatformServer(project:CordovaProjectInfo){
    let platform = this.currentTask.selectedPlatform;
    if(!platform){
      Logger.getInstance().warn("No platform detected: server not started");
      return Promise.resolve();
    }
    if(this.isPlatformServerRunning()){
      Logger.getInstance().warn("Platform server already started");
      return Promise.resolve();
    }
    Logger.getInstance().info(`Platform Server for ${platform} starting`);
    const srvConf:PlatformServerConfig = TaskUtils.createPlatformServerConfig(this.currentTask,project);
    if(!srvConf){
      Logger.getInstance().error("Server configuration build fail");
      return Promise.resolve();
    }
    await this.cordova.prepareProjectWithBrowserPatch(project.path);
    this.platformServer = PlatformServerImpl.createNew();
    this.platformServer.start(srvConf);
  }

  stopServer(){
    if(this.platformServer){
      this.platformServer.stop().then(() => {
          Logger.getInstance().info("Server stop done");
      },() => {
        Logger.getInstance().error("Server stop fail");
      });
    }
  }

  stop(){
    if(this.scriptExecutor){
      this.scriptExecutor.stop();
    }
    this.cordova.stopExecutor();
    this.stopServer();
  }

  isPlatformServerRunning():boolean{
    return this.platformServer && this.platformServer.isRunning();
  }


  private async scheduleNodeScripts(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo){
    if(!taskConfig.nodeTasks || !(taskConfig.nodeTasks.length > 0)){
      Logger.getInstance().debug('No script defined');
      return Promise.resolve();
    }
    Logger.getInstance().debug('Begin npm script run');
    this.scriptExecutor = new ScriptExecutor();
    let res= await this.scriptExecutor.runNpmScripts(taskConfig.nodeTasks,project.path);
    Logger.getInstance().debug('End npm script run');
    return res;
  }

}
