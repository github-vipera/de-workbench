'use babel'

import { EventEmitter }  from 'events'
import { Logger } from '../../logger/Logger'
import { EventBus } from '../../DEWorkbench/EventBus'
import { PushSender, PushMessage } from './PushSender'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const gcm = allowUnsafeNewFunction(()=> allowUnsafeEval(() => require('node-gcm')));

export class GCMService implements PushSender {

  private projectRoot: string;
  private configuration:any;
  private ready:boolean=false;

  constructor(){
  }

  public initialize(configuration:any){
    this.ready = true;
    this.configuration = configuration;
  }

  public sendPushMessage(message:PushMessage):Promise<any>{
    return new Promise((resolve,reject)=>{
      Logger.getInstance().debug("Sending to GCM...Data: " + JSON.stringify(message));
        if(!this.ready){
          Logger.getInstance().warn("sendPush fail: gcm Provider is undefined");
          return;
        }
        var gcmMessage = this.toGCMNotification(message);

        var recipients = message.recipients;

        Logger.getInstance().debug("GCM message: " + JSON.stringify(message));

        var sender = new gcm.Sender(this.configuration.apikey);

        // Send the message
        // ... trying only once
        try {

          sender.sendNoRetry(gcmMessage, { registrationTokens: recipients }, function(err, response) {
            if (err) {
              Logger.getInstance().error("Error sending GCM notification: " + err);
              reject(err);
            } else {
              resolve("GCM message sent: " + response);
            }
          });

        } catch(ex){
          reject(ex);
        }
    })

  }

  protected toGCMNotification(pushData:PushMessage){
    let message = new gcm.Message();
    // Add notification payload as key value
    if (pushData.alert){
      message.addData('title', pushData.alert);
    }
    if (pushData.title){
      message.addData('title', pushData.title);
    }
    if (pushData.body){
      message.addData('body', pushData.body);
    }
    if (pushData.icon){
      message.addData('icon', pushData.icon);
    }
    if (pushData.badge){
      message.addData('badge', pushData.badge);
    }
    if (pushData.sound){
      message.addData('sound', pushData.sound);
    }
    if (pushData.payload){
      message.addData('payload',pushData.payload);
    }
    return message
  }


  public isReady():boolean {
    return this.ready;
  }


}
