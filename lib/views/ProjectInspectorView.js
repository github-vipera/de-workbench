'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement } from '../element/index';
import { EventEmitter } from 'events';
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Cordova } from '../cordova/Cordova';
export class ProjectInspectorView {
    constructor() {
        this.atomWorkspace = atom.workspace;
        this.events = new EventEmitter();
        // create Cordova utilities and tools
        this.cordova = new Cordova();
        // Create the UI
        this.element = document.createElement('xatom-debug-area'); //'de-workbench-projinspector-view'
        /**
        let title =  createElement('scheme-label', {
            elements: [createText('Project Inspector Ahahah')]
        })
        insertElement(this.element, title)
        **/
        let el = createElement('xatom-debug-group', {
            elements: [
                createElement('xatom-debug-group-header', {
                    elements: [createText('Installed Platforms')]
                }),
                createElement('xatom-debug-group-header', {
                    elements: [createText('Installed Plugins')]
                })
            ]
        });
        insertElement(this.element, el);
        // Listen events
        ProjectManager.getInstance().didProjectChanged((projectPath) => this.onProjectChanged(projectPath));
    }
    open() {
        if (this.item) {
            this.atomWorkspace.toggle(this.item);
        }
        else {
            const prefix = "dewb";
            const uri = prefix + '//' + '_prjinspector';
            this.item = {
                activatePane: true,
                searchAllPanes: true,
                location: 'right',
                element: this.element,
                getTitle: () => 'DE Project Inspector',
                getURI: () => uri,
                getDefaultLocation: () => 'right',
                getAllowedLocations: () => ['left', 'right']
            };
            this.atomWorkspace.open(this.item).then((view) => {
            });
        }
    }
    close() {
        this.panel.hide();
    }
    onProjectChanged(projectPath) {
        this.cordova.getInstalledPlatforms(projectPath).then((platforms) => {
            this.displayInstalledPlatforms(platforms);
        });
        this.cordova.getInstalledPlugins(projectPath).then((plugins) => {
            //console.log("Plugins installed: ", plugins);
        });
    }
    displayInstalledPlatforms(platforms) {
        console.log("Installed platforms:", platforms);
        for (let platform of platforms) {
            console.log(platform.name);
        }
    }
}
//# sourceMappingURL=ProjectInspectorView.js.map