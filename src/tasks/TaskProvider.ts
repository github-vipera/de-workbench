'use babel'
import {CordovaTaskConfiguration} from '../cordova/CordovaTasks';

export class TaskProvider{

  private static instance:TaskProvider;
  private defaultTasks:Array<CordovaTaskConfiguration>= null;
  private constructor(){
    console.log("Create TaskProvider");
  }

  public static getInstance():TaskProvider{
    if(!TaskProvider.instance){
      TaskProvider.instance = new TaskProvider();
    }
    return TaskProvider.instance;
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
