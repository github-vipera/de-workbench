'use babel'


export interface PushSender {
  initialize(config:any);
  sendPushMessage(message:PushMessage):Promise<any>
}

export interface PushMessage {
  recipients:Array<string>;
  badge?:string;
  sound?:string;
  title?:string;
  body?:string;
  topic?:string;
  category?:string;
  alert?:string;
  payload?:string;
  icon?:string;
}
