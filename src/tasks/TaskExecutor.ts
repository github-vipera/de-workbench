'use babel'
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Cordova , CordovaProjectInfo} from '../cordova/Cordova';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks'
export class TaskExecutor{
  private currentTask:CordovaTaskConfiguration;
  private cordova:Cordova
  constructor(){
      this.cordova=ProjectManager.getInstance().cordova;
  }
  public async executeTask(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo):Promise<any>{
    if(this.isBusy()){
      throw new Error("TaskExecutor is busy");
    }
    this.currentTask = taskConfig;
    try{
      switch(this.currentTask.taskType){
        case "build":
            await this.executeBuild(project);
            this.currentTask = null
        break;
        case "run":
            await this.executeRun(project);
            this.currentTask = null
        break;
      }
    }catch(err){
      this.currentTask = null;
      throw err;
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
    let platform = this.currentTask.selectedPlatform ?this.currentTask.selectedPlatform.name : null;
    return this.cordova.runProject(project.path, platform ,null,{});
  }
}
