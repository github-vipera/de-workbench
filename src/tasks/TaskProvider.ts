'use babel'
import {CordovaTaskConfiguration} from '../cordova/CordovaTasks';
import {cloneDeep,forEach} from 'lodash'
import {ProjectManager} from '../DEWorkbench/ProjectManager'
import {ProjectSettings} from '../DEWorkbench/ProjectSettings'
const CORDOVA_TASK_LIST_KEY:string = 'cdvTaskList';

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
      isVariantEnabled:true,
      isNodeTaskEnabled:true
    }
    let cdvBuild= new CordovaTaskConfiguration('CordovaBuid','build');
    cdvBuild.displayName='Build';
    cdvBuild.constraints = {
      isDeviceEnabled:false,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isVariantEnabled:true,
      isNodeTaskEnabled:true
    }
    let cdvRun = new CordovaTaskConfiguration('CordovaRun','run');
    cdvRun.displayName='Run';
    cdvRun.constraints = {
      isDeviceEnabled:true,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isVariantEnabled:true,
      isNodeTaskEnabled:true
    }
    let cdvBuildAndRun = new CordovaTaskConfiguration('CordovaBuidRun','buildRun');
    cdvBuildAndRun.displayName='Build & Run';
    cdvBuildAndRun.constraints = {
      isDeviceEnabled:true,
      isMockConfigEnabled:false,
      isEnvVarEnabled:true,
      isVariantEnabled:true,
      isNodeTaskEnabled:true
    }
    let tasks:Array<CordovaTaskConfiguration> = [cdvPrepare, cdvBuild, cdvRun, cdvBuildAndRun];
    return tasks;
  }

  public loadTasksForProject(projectPath:string):Array<CordovaTaskConfiguration>{
    console.log('loadTasksForProject');
    let defaultTasks = this.getDefaultTask();
    if(!projectPath){
      return defaultTasks;
    }
    let setting:ProjectSettings = ProjectManager.getInstance().getProjectSettings(projectPath);
    if(!setting){
      return defaultTasks;
    }
    let savedTasks = setting.get('cdvTaskList');
    console.log("savedTasks",savedTasks);
    if(!savedTasks){
      return defaultTasks;
    }
    let parsedResult:Array<CordovaTaskConfiguration> = [];
    forEach(savedTasks,(item) => {
      parsedResult.push(CordovaTaskConfiguration.fromJSON(item));
    });
    console.log("parsedResult:",savedTasks);
    return parsedResult;
  }

  public storeTasks(cdvTaskList:Array<CordovaTaskConfiguration>,projectPath:string):void{
    let setting:ProjectSettings = ProjectManager.getInstance().getProjectSettings(projectPath);
    setting.save(CORDOVA_TASK_LIST_KEY,cdvTaskList);
  }
}
