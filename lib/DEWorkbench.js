'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { ToolbarView } from './toolbar/ToolbarView';
import { NewProjectView } from './views/NewProjectView';
import { EventEmitter } from 'events';
const { CompositeDisposable } = require('atom');
import { ProjectInspectorView } from './views/ProjectInspectorView';
import { DebugAreaView } from './views/DebugAreaView';
import { CordovaUtils } from './cordova/CordovaUtils';
import { ProjectManager } from './DEWorkbench/ProjectManager';
import { Logger } from './logger/Logger';
import { attachEventFromObject } from './element/index';
export class DEWorkbench {
    constructor(options) {
        Logger.getInstance().info("Initializing DEWorkbench...");
        let cu = new CordovaUtils();
        this.projectManager = ProjectManager.getInstance();
        this.events = new EventEmitter();
        // Create the main toolbar
        this.toolbarView = new ToolbarView({
            didNewProject: () => {
                this.newProjectView.open();
            },
            didToggleToolbar: () => {
                this.toggleToolbar();
            },
            didTogglePrjInspector: () => {
                this.togglePrjInspector();
            },
            didToggleDebugArea: () => {
                this.toggleDebugArea();
            }
        });
        // Create the New Project modal window
        this.newProjectView = new NewProjectView();
        // Create a prject inspector dock window
        this.projectInspectorView = new ProjectInspectorView();
        this.debugAreaView = new DebugAreaView();
        attachEventFromObject(this.events, [
            'didToggleToolbar'
        ], options);
        ProjectManager.getInstance().didProjectChanged((projectPath) => this.onProjectChanged(projectPath));
        Logger.getInstance().info("DEWorkbench initialized successfully.");
    }
    onProjectChanged(projectPath) {
        Logger.getInstance().debug("DEWorkbench onProjectChanged: ", projectPath);
        //console.log("DEWorkbench onProjectChanged: " , projectPath)
    }
    openProjectInspector() {
        this.projectInspectorView.open();
    }
    openDebugArea() {
        this.debugAreaView.open();
    }
    toggleToolbar() {
        this.events.emit('didToggleToolbar');
    }
    togglePrjInspector() {
        Logger.getInstance().debug("DEWorkbench togglePrjInspector called");
        this.events.emit('didTogglePrjInspector');
        this.openProjectInspector();
    }
    toggleDebugArea() {
        Logger.getInstance().debug("DEWorkbench toggleDebugArea called");
        this.events.emit('didToggleDebugArea');
        this.openDebugArea();
    }
    getToolbarElement() {
        return this.toolbarView.getElement();
    }
    destroy() {
        // destroy all
        Logger.getInstance().info("DEWorkbench destroying...");
    }
}
//# sourceMappingURL=DEWorkbench.js.map