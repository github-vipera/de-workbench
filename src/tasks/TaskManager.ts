'use babel'
import {CordovaTaskConfiguration} from '../cordova/CordovaTasks';

export class TaskManager{

  private static instance:TaskManager;
  private defaultTasks:Array<CordovaTaskConfiguration>= null;
  private constructor(){
    console.log("Create TaskManager");
  }

  public static getInstance():TaskManager{
    if(!TaskManager.instance){
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }

  public getDefaultTask(){
    if(this.defaultTasks == null){
      this.defaultTasks = this.createDefaultTasks();
    }
    return this.defaultTasks;
  }

  createDefaultTasks():Array<CordovaTaskConfiguration>{
    let cdvPrepare = new CordovaTaskConfiguration('CordovaPrepare','prepare');
    cdvPrepare.displayName='Prepare';
    cdvPrepare.constraints = {
      isDeviceEnabled:false,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isNodeTaskEnabled:true
    }
    let cdvBuild= new CordovaTaskConfiguration('CordovaBuid','build');
    cdvBuild.displayName='Build';
    cdvBuild.constraints = {
      isDeviceEnabled:false,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isNodeTaskEnabled:true
    }
    let cdvRun = new CordovaTaskConfiguration('CordovaRun','run');
    cdvRun.displayName='Run';
    cdvRun.constraints = {
      isDeviceEnabled:true,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isNodeTaskEnabled:true
    }
    let cdvBuildAndRun = new CordovaTaskConfiguration('CordovaBuidRun','buildRun');
    cdvBuildAndRun.displayName='Build & Run';
    cdvBuildAndRun.constraints = {
      isDeviceEnabled:true,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isNodeTaskEnabled:true
    }
    let tasks:Array<CordovaTaskConfiguration> = [cdvPrepare, cdvBuild, cdvRun, cdvBuildAndRun];
    return tasks;
  }
}
