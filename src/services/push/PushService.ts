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
  projectRoot: string;
  apnConfig:any;
  gcmConfig:any;
}

export enum PushPlatorm {
  APN = 'apn',
  GCM = 'gcm'
}

export class PushService {

  private projectRoot: string;
  private platforms:{}
  private options:PushServiceOptions;

  constructor(options:PushServiceOptions){
    this.options = options;
    this.projectRoot = options.projectRoot;
    this.initPlatformServices();
  }

  protected initPlatformServices(){
      let apn = new APNService();
      apn.initialize(this.options.apnConfig)
      this.platforms["apn"] = apn;

      let gcm = new GCMService();
      gcm.initialize(this.options.gcmConfig)
      this.platforms["gcm"] = gcm;
  }

  public async sendPushMessage(message:PushMessage, platform:PushPlatorm):Promise<any>{
    let pushSender = this.getSenderService(platform);
    if (pushSender){
      pushSender.sendPushMessage(message)
    } else {
      throw('No sender found for '+ platform +'')
    }
  }

  protected getSenderService(platform:PushPlatorm):PushSender {
      return this.platforms[platform.toString()]
  }

}
