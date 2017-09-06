'use babel'
import {CordovaExecutor} from './CordovaExecutor'
import { map } from 'lodash'
export interface CordovaDevice {
  targetId:string,
  name:string
}
export class CordovaDeviceManager {
  private cordovaExecutor:CordovaExecutor = null;
  constructor(projectPath:any){
    this.cordovaExecutor = new CordovaExecutor(projectPath);
  }
  async getDeviceList(platform:string):Promise<Array<CordovaDevice>>{
    let devices:Array<any> = await this.cordovaExecutor.getAllDeviceByPlatform(platform);
    if(devices){
      return map<any,CordovaDevice>(devices,(single) => {
        return {
          targetId : single,
          name : single
        }
      });
    }
    return null;
  }
}
