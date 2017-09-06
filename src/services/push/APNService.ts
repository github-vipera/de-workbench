'use babel'

import { EventEmitter }  from 'events'
import { Logger } from '../../logger/Logger'
import { EventBus } from '../../DEWorkbench/EventBus'
import { PushSender, PushMessage } from './PushSender'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const apn = allowUnsafeNewFunction(()=> allowUnsafeEval(() => require('apn')));

export class APNService implements PushSender {

  private projectRoot: string;
  private configuration:any;
  private ready:boolean=false;
  private apnProvider:any;
  private options:{};

  constructor(){
  }

  public initialize(configuration:any){
    this.configuration = configuration;

    if(!this.configuration.cert || !this.configuration.key || !this.configuration.passphrase){
      this.configuration=undefined;
      Logger.getInstance().warn("Invalid apn configuration.");
      return;
    }

    this.options = {
        cert: this.configuration.cert,
        key: this.configuration.key,
        passphrase: this.configuration.passphrase,
        production: this.configuration.production
    };
    this.apnProvider = new apn.Provider(this.options);

    this.ready = true;
  }

  public sendPushMessage(message:PushMessage):Promise<any>{
    return new Promise((resolve,reject)=>{
      Logger.getInstance().debug("Sending to APN...Data: " + JSON.stringify(message));
        if(!this.ready){
          Logger.getInstance().warn("sendPush fail: apnProvider is undefined");
          return;
        }
        var note = this.toApnNotification(message);

        var recipients = message.recipients;

        Logger.getInstance().debug("APN note: " + JSON.stringify(note));

        for (var i=0;i<recipients.length;i++){
          this.apnProvider.send(note, recipients[i]).then( (result) => {
              if (result.failed.length>0){
                var details = "Error results: " + JSON.stringify(result.failed);
                Logger.getInstance().error("Error sending push message: "+ result.failed[0].error +" ", details)
                reject(result.failed[0].error.message)
                //reject({ message: result.failed[0].error.message, severity:"error", details: result.failed[0].error.stack});
              } else {
                resolve("APN Message sent.");
              }
              //console.dir(result);
          });
        }
    })

  }

  protected toApnNotification(message:PushMessage){
    let apnNotification = new apn.Notification();
    if (message.badge){
      apnNotification.badge = message.badge;
    }
    if (message.sound){
      apnNotification.sound = message.sound;
    }
    if (message.title){
      apnNotification.title = message.title;
    }
    if (message.body){
      apnNotification.body = message.body;
    }
    if (message.topic){
      apnNotification.topic = message.topic;
    }
    if (message.category){
      apnNotification.category = message.category;
    }
    if (message.alert){
      apnNotification.alert = message.alert;
    }
    if (message.payload){
      apnNotification.payload = message.payload;
    }
    return apnNotification
  }


  public isReady():boolean {
    return this.ready;
  }


}
