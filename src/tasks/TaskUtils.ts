'use babel'
import {ProjectManager} from '../DEWorkbench/ProjectManager'
import {Cordova, CordovaPlatform, CordovaProjectInfo} from '../cordova/Cordova'
import {PlatformServerConfig} from '../services/remote/PlatformServer'
import {CordovaTaskConfiguration} from '../cordova/CordovaTasks';
import {CordovaUtils} from '../cordova/CordovaUtils';
import {Logger} from '../logger/Logger';

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
      if(platform === 'android'){
        return 3000;
      }
      else if(platform === 'ios'){
        return 3001;
      }
      else if(platform === 'browser'){
        return 3000;
      }
  }

}
