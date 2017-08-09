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

    // Project events
    public static get EVT_PROJECT_CHANGED():string { return "dewb.project.workspace.projectChanged"; }
    public static get EVT_PATH_CHANGED():string { return "dewb.project.workspace.pathChanged"; }
    public static get EVT_PLUGIN_ADDED():string { return "dewb.project.cordova.pluginAdded"; }
    public static get EVT_PLUGIN_REMOVED():string { return "dewb.project.cordova.pluginRemoved"; }
    public static get EVT_PLATFORM_ADDED():string { return "dewb.project.cordova.platformRemoved"; }
    public static get EVT_PLATFORM_REMOVED():string { return "dewb.project.cordova.platformRemoved"; }

    // Workbench events
    public static get EVT_WORKBENCH_PLUGIN_ADDED():string { return "dewb.workbench.plugins.pluginAdded"; }


    private static instance: EventBus;
    private _eventBus:any;
    private eventEmitter:EventEmitter;

    private constructor() {
      this.eventEmitter = new EventEmitter();
    }

    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    public subscribe(topic:string, listener){
      this.eventEmitter.on(topic,listener);
    }

    public publish(topic:string, ...args) {
      //this._eventBus.publish(topic, args)
      this.eventEmitter.emit(topic,args);
    }

    public unsubscribe(topic:string, listener){
      this.eventEmitter.removeListener(topic, listener)
    }

}
