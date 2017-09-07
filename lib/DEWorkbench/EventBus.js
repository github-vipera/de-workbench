'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { EventEmitter } from 'events';
export class EventBus {
    // Project events
    static get EVT_PROJECT_CHANGED() { return "dewb.project.workspace.projectChanged"; }
    static get EVT_PATH_CHANGED() { return "dewb.project.workspace.pathChanged"; }
    static get EVT_PLUGIN_ADDED() { return "dewb.project.cordova.pluginAdded"; }
    static get EVT_PLUGIN_REMOVED() { return "dewb.project.cordova.pluginRemoved"; }
    static get EVT_PLATFORM_ADDED() { return "dewb.project.cordova.platformRemoved"; }
    static get EVT_PLATFORM_REMOVED() { return "dewb.project.cordova.platformRemoved"; }
    // Workbench events
    static get EVT_WORKBENCH_PLUGIN_ADDED() { return "dewb.workbench.plugins.pluginAdded"; }
    constructor() {
        this.eventEmitter = new EventEmitter();
    }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    subscribe(topic, listener) {
        this.eventEmitter.on(topic, listener);
    }
    publish(topic, ...args) {
        this.eventEmitter.emit(topic, args);
    }
    unsubscribe(topic, listener) {
        this.eventEmitter.removeListener(topic, listener);
    }
    on(topic, listener) {
        this.eventEmitter.on(topic, listener);
    }
    emit(topic, ...args) {
        this.eventEmitter.emit(topic, args);
    }
}
//# sourceMappingURL=EventBus.js.map