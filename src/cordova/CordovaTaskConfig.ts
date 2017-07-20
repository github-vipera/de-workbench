'use babel'
import {Cordova, CordovaPlatform} from './Cordova'

export interface MockConfiguration {
  mockFilePath:string
  jsLibraryLoaderPath?:string
}

export type CordovaTaskType = "prepare" | "compile" | "build" | "run";


export class CordovaTaskConfiguration {
  private _taskType: CordovaTaskType
  private _projectPath:string
  private _selectedPlatform: CordovaPlatform
  private _variantName:string
  private _isRelease:boolean
  private _mockConfig:MockConfiguration
  private _nodeTasks:Array<String>
  constructor(taskType?:CordovaTaskType){
    this.taskType = taskType;
  }

  get taskType():CordovaTaskType{
    return this._taskType;
  }

  set taskType(value:CordovaTaskType){
    this._taskType = value;
  }

  get projectInfo():string{
    return this._projectPath
  }

  set projectInfo(value:string){
    this._projectPath = value;
  }

  get selectedPlatform():CordovaPlatform{
    return this._selectedPlatform
  }

  set selectedPlatform(value:CordovaPlatform){
    this._selectedPlatform = value;
  }

  get variantName():string{
    return this._variantName
  }

  set variantName(value:string){
    this._variantName = value;
  }

  get isRelease():boolean{
    return this._isRelease
  }

  set isRelease(value:boolean){
    this._isRelease = value;
  }

  get mockConfig():MockConfiguration{
    return this._mockConfig
  }

  set mockConfig(value:MockConfiguration){
    this._mockConfig = value;
  }

  get nodeTasks():Array<String>{
    return this._nodeTasks
  }

  set nodeTasks(value:Array<String>){
    this._nodeTasks = value;
  }

  static fromJSON(json:Object):CordovaTaskConfiguration {
    let result=new CordovaTaskConfiguration();
    Object.assign(result,json);
    return result;
  }

  static toJSON(taskConfig: CordovaTaskConfiguration):string {
    return JSON.stringify(taskConfig);
  }

}
