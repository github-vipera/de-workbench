'use babel'

import { EventEmitter }  from 'events'
import { Logger } from '../../logger/Logger'
import { EventBus } from '../../DEWorkbench/EventBus'
import { PushSender, PushMessage } from './PushSender'
import { APNService } from './APNService'
import { GCMService } from './GCMService'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const express = allowUnsafeEval(() => require('express'));

export interface PushServiceOptions {
  apn:any;
  gcm:any;
}

export enum PushPlatform {
  APN = 'apn',
  GCM = 'gcm'
}

export class PushService {

  private platforms:any;
  private options:PushServiceOptions;

  constructor(){
    this.initPlatformServices();
  }

  protected initPlatformServices(){
    this.platforms = {};

      let apn = new APNService();
      this.platforms["apn"] = apn;

      let gcm = new GCMService();
      this.platforms["gcm"] = gcm;
  }

  public async sendPushMessage(message:PushMessage, platform:PushPlatform, options:PushServiceOptions):Promise<any>{
    let pushSender = this.getSenderService(platform);
    let platformConfig = this.getConfigForPlatform(options, platform);
    if (pushSender){
      try{
        pushSender.initialize(platformConfig);
        await pushSender.sendPushMessage(message)
      } catch(ex){
        throw('Error sending message: '+ ex)
      }
    } else {
      throw('No sender found for '+ platform +'')
    }
  }

  protected getConfigForPlatform(options:PushServiceOptions, platform:PushPlatform){
    if (platform===PushPlatform.APN){
      return options.apn;
    } else if (platform===PushPlatform.GCM){
      return options.gcm;
    }
  }

  protected getSenderService(platform:PushPlatform):PushSender {
      return this.platforms[platform.toString()]
  }

}
