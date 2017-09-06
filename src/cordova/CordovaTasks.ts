'use babel'
import {Cordova, CordovaPlatform} from './Cordova'
import { CordovaDevice } from './CordovaDeviceManager'

export type CordovaTaskType = "prepare" | "compile" | "build" | "run" | "buildRun";
export interface TaskConstraints {
  isDeviceEnabled:boolean,
  isMockConfigEnabled:boolean,
  isNodeTaskEnabled:boolean
  isVariantEnabled:boolean
  isEnvVarEnabled:boolean
  isCustom?:boolean
}

export interface CordovaCliOptions {
  flags:Array<string>
  envVariables:Array<{name:string, value:string}>
}


export class CordovaTaskConfiguration {
  private _name:string
  private _displayName:string
  private _taskType: CordovaTaskType
  private _selectedPlatform: CordovaPlatform
  private _variantName:string
  private _isRelease:boolean
  private _nodeTasks:Array<string>
  private _device:CordovaDevice
  private _envVariables: Array<{name:string, value:string}>
  private _cliParams: Array<string>
  private _constraints: TaskConstraints

  constructor(name?:string,taskType?:CordovaTaskType){
    this._name=name
    this.taskType = taskType;
  }

  get name():string{
    return this._name;
  }

  set name(value:string){
    this._name=value;
  }

  get displayName():string{
    return this._displayName;
  }

  set displayName(value:string){
    this._displayName=value;
  }

  get taskType():CordovaTaskType{
    return this._taskType;
  }

  set taskType(value:CordovaTaskType){
    this._taskType = value;
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

  get nodeTasks():Array<string>{
    return this._nodeTasks
  }

  set nodeTasks(value:Array<string>){
    this._nodeTasks = value;
  }

  get constraints():TaskConstraints {
    return this._constraints;
  }

  set constraints(value:TaskConstraints) {
    this._constraints=value;
  }

  get device():CordovaDevice {
    return this._device;
  }

  set device(value:CordovaDevice) {
    this._device=value;
  }

  get envVariables():Array<{name:string,value:string}> {
    return this._envVariables;
  }

  set envVariables(value:Array<{name:string,value:string}>) {
    this._envVariables=value;
  }

  get cliParams():Array<string> {
    return this._cliParams;
  }

  set cliParams(value:Array<string>) {
    this._cliParams=value;
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

export abstract class CordovaTask {
  private _name:string;
  private _configuration: CordovaTaskConfiguration;
  constructor (name:string,configuration?:CordovaTaskConfiguration){
    this._name=name;
    this._configuration= configuration;
  }

  get name():string{
    return this._name;
  }

  get configuration():CordovaTaskConfiguration{
    return this._configuration;
  }

  set configuration(configuration:CordovaTaskConfiguration){
    this._configuration= configuration;
  }

}
