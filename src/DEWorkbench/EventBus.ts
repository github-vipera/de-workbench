'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { EventEmitter }  from 'events'
import { Cordova } from '../cordova/Cordova'
import { Logger } from '../logger/Logger'


export class EventBus {

    private static instance: EventBus;
    private _eventBus:any;

    private constructor() {
      let EvtBusModule = require('@nsisodiya/eventbus')
      this._eventBus = new EvtBusModule();
    }

    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public subscribe(topic:string, callback:Function){
      this._eventBus.subscribe(topic, callback)
    }

    public subscribeAll(callback:Function){
      this._eventBus.subscribeAll(callback)
    }

    public publish(topic:string, ...args) {
      this._eventBus.publish(topic, args)
    }

}
