'use babel'
import * as _ from 'lodash'
export class EventSupport{
  private _evtListeners:Array<EventSupportDelegate> = [];
  constructor(){

  }
  addEventListener(listener:EventSupportDelegate){
    this._evtListeners.push(listener)
  }
  removeEventListener(listener:EventSupportDelegate){
    _.remove(this._evtListeners,function(ref){
      return ref == listener;
    });
  }
  removeAllListeners(){
    this._evtListeners=[];
  }
  fireEvent(name:string,...data){
    setTimeout(() => {
      _.forEach(this._evtListeners,(delegateFn) => {
        delegateFn(name,data);
      });
    });
  }
}

export type EventSupportDelegate = (name:string,...data) => void;
