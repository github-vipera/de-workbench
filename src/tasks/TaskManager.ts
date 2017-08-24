'use babel'
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Cordova , CordovaProjectInfo} from '../cordova/Cordova';
import { CordovaTaskConfiguration, CordovaCliOptions} from '../cordova/CordovaTasks'
import { PlatformServerConfig, LiveActions} from '../services/remote/PlatformServer'
import { TaskUtils } from './TaskUtils'
import { Logger }  from '../logger/Logger'
import { ScriptExecutor } from './ScriptExecutor'
import { CordovaDevice } from '../cordova/CordovaDeviceManager'
import { RuntimeSessionHandler } from '../services/remote/RuntimeSessionHandler'

export interface LiveReloadContext {
  runTask?:CordovaTaskConfiguration;
  project?:CordovaProjectInfo
  cliOptions?: CordovaCliOptions
}



export class TaskManager{
  private currentTask:CordovaTaskConfiguration;
  private project:CordovaProjectInfo
  private runtimeSessionHandler:RuntimeSessionHandler
  private scriptExecutor:ScriptExecutor = null;
  private cordova:Cordova

  private reloadContext:LiveReloadContext = {}
  constructor(){
      this.cordova=ProjectManager.getInstance().cordova;
  }
  public async executeTask(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo):Promise<any>{
    if(this.isBusy()){
      throw new Error("TaskManager is busy");
    }
    let cliOptions = TaskUtils.createCliOptions(taskConfig);
    Logger.getInstance().info("cliOptions:",JSON.stringify(cliOptions));
    await this.scheduleNodeScripts(taskConfig,project,cliOptions);
    this.currentTask = taskConfig;
    this.project = project;
    Logger.getInstance().debug('schedule node tasks');
    try{
      switch(this.currentTask.taskType){
        case "prepare":
            await this.executePrepare(project,cliOptions);
            this.currentTask = null;
        break;
        case "build":
            await this.executeBuild(project,cliOptions);
            this.currentTask = null
        break;
        case "run":
            await this.executeRun(project,cliOptions);
            this.currentTask = null
        break;
        case "buildRun":
            await this.executeBuild(project,cliOptions);
            await this.executeRun(project,cliOptions)
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
  async executeBuild(project:CordovaProjectInfo,cliOptions: CordovaCliOptions){
    let platform= this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    return this.cordova.buildProject(project.path, platform ,cliOptions);
  }

  async executeRun(project:CordovaProjectInfo,cliOptions: CordovaCliOptions){
    await this.startPlatformServer(project);

    this.reloadContext.cliOptions = cliOptions;
    this.reloadContext.project = project;
    this.reloadContext.runTask = this.currentTask;

    let platform = this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    if(platform === 'browser'){
      cliOptions.flags ? cliOptions.flags.push('--noprepare'): ['--noprepare'];
      cliOptions.flags.push('--port=' + parseInt(atom.config.get('de-workbench.BrowserEmulationPort')));
    }
    let target:string =  this.currentTask.device ? this.currentTask.device.targetId : null;
    return this.cordova.runProject(project.path, platform ,target,cliOptions);
  }

  async executePrepare(project:CordovaProjectInfo,cliOptions: CordovaCliOptions){
    let platform = this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    return this.cordova.prepareProject(project.path,platform,cliOptions);
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
    await this.cordova.prepareProjectWithBrowserPatch(project.path,platform.name);
    this.runtimeSessionHandler = RuntimeSessionHandler.createRuntimeSession(srvConf);
  }

  stopServer(){
    if(this.runtimeSessionHandler){
      this.runtimeSessionHandler.stopServer().then(() => {
          Logger.getInstance().info("Server stop done");
          this.reloadContext = {};
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
    return this.runtimeSessionHandler && this.runtimeSessionHandler.isPlatformServerRunning();
  }

  /**
   * Async action execution
   * @param  {LiveActions} action runtime action to execute
   */
  public async sendAction(action:LiveActions) {
    if(this.isPlatformServerRunning()){
      Logger.getInstance().debug("sendAction ",action.type);
      await this.execActionTask(action);
      await this.runtimeSessionHandler.sendAction(action);
      return Promise.resolve();
    }
    return Promise.resolve();
  }

  private async execActionTask(action:LiveActions){
    await this.scheduleNodeScripts(this.reloadContext.runTask,this.reloadContext.project,this.reloadContext.cliOptions);
    if(action.type == "doLiveReload"){
      let platform = this.reloadContext.runTask.selectedPlatform ? this.reloadContext.runTask.selectedPlatform.name : null;
      await this.cordova.prepareProjectWithBrowserPatch(this.reloadContext.project.path,platform,this.reloadContext.cliOptions);
    }
    return Promise.resolve();
  }


  private async scheduleNodeScripts(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo,cliOptions: CordovaCliOptions){
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

  public getRuntimeSessionHandler():RuntimeSessionHandler{
    return this.runtimeSessionHandler;
  }

}
