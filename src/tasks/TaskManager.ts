import { TaskExecutor } from '../tasks/TaskExecutor'
import { Cordova , CordovaProjectInfo} from '../cordova/Cordova';
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks'
const HISTORY_SIZE:number = 10;
export class TaskManager {
  private static instance: TaskManager;
  private taskExecutor: TaskExecutor;
  private taskHistory: Array<CordovaTaskConfiguration> = [];
  private constructor() {
    this.taskExecutor = new TaskExecutor();
  }
  static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager();
    }
    return TaskManager.instance;
  }
  getExecutor(): TaskExecutor {
    return this.taskExecutor;
  }
  isBusy():boolean{
    return this.taskExecutor.isBusy();
  }
  public async executeTask(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo):Promise<any>{
    return this.taskExecutor.executeTask(taskConfig,project);
  }
  public async executeTaskChain(tasks:Array<CordovaTaskConfiguration>,project:CordovaProjectInfo):Promise<any>{
    return this.taskExecutor.executeTaskChain(tasks,project);
  }

  public getHistory():Array<CordovaTaskConfiguration>{
    return this.taskHistory;
  }

  private addToHistory(conf:CordovaTaskConfiguration){
    this.taskHistory.unshift(conf);
    this.taskHistory = this.taskHistory.slice(0,HISTORY_SIZE);
  }

}
