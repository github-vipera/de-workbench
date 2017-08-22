'use babel'
import {ProjectManager} from '../DEWorkbench/ProjectManager'
import {Cordova, CordovaPlatform, CordovaProjectInfo} from '../cordova/Cordova'
import {PlatformServerConfig} from '../services/remote/PlatformServer'
import {CordovaTaskConfiguration, CordovaCliOptions} from '../cordova/CordovaTasks';
import {CordovaUtils} from '../cordova/CordovaUtils';
import {Logger} from '../logger/Logger';
import {findIndex, forEach} from 'lodash'
const CORDOVA_BUILD_VARIANT:string = 'CORDOVA_BUILD_VARIANT';

export class TaskUtils {
  private constructor(){}
  public static createPlatformServerConfig(taskConfig:CordovaTaskConfiguration,project:CordovaProjectInfo):PlatformServerConfig{
    let selectedPlatform:CordovaPlatform = taskConfig.selectedPlatform;
    if(!selectedPlatform){
      Logger.getInstance().warn('Platform is not defined: starting of server suspended');
      return null;
    }
    let cordova:Cordova = ProjectManager.getInstance().cordova;
    let platformPath = cordova.getPlatformPath(project.path,selectedPlatform.name);
    let serveStaticAssets:boolean = true;
    if(!platformPath){
      Logger.getInstance().warn('PlatformPath is not defined: force disable publish of static assets');
      serveStaticAssets = false;
    }
    return {
      serveStaticAssets:serveStaticAssets,
      platformPath: platformPath,
      port: TaskUtils.getPlatformServerPort(selectedPlatform.name)
    }
  }

  public static getPlatformServerPort(platform:string):number{
      //TODO read from config
      if(platform === 'android'){
        return 3000;
      }
      else if(platform === 'ios'){
        return 3001;
      }
      else if(platform === 'browser'){
        return 3002;
      }
  }

  public static createUniqueTaskName(tasks:Array<CordovaTaskConfiguration>,baseName?:string):string {
    let prefix:string = baseName ? baseName + "_Clone":"Clone";
    let cname:string;
    let suffix:number = 0;
    do{
      suffix++;
      cname = `${prefix}_${suffix}`;
    }while(findIndex(tasks,(item) => {
          return item.name == cname;
        }) > 0);

    return cname;
  }

  public static createCliOptions(taskConfig:CordovaTaskConfiguration):CordovaCliOptions{
    if(!taskConfig){
      return null;
    }
    let cliParamsList:Array<string> = taskConfig.cliParams || [];
    let envVariables:Array<{name:string,value:string}> = taskConfig.envVariables || [];
    let cliOptions:CordovaCliOptions = {
      flags:[],
      envVariables:[]
    }
    forEach(cliParamsList, (single) => {
      cliOptions.flags.push(single);
    });
    forEach(envVariables,(single:{name:string,value:string}) => {
      cliOptions.envVariables.push(single);
    });
    if(taskConfig.variantName){
      cliOptions.envVariables.push({name:CORDOVA_BUILD_VARIANT, value:taskConfig.variantName})
    }
    return cliOptions;
  }



}
