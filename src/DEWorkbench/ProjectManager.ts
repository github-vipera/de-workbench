'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { EventEmitter }  from 'events'
import { Cordova } from '../cordova/Cordova'

export class ProjectManager {

    private static instance: ProjectManager;
    private currentProjectPath: String;
    private events: EventEmitter;
    public cordova: Cordova;

    private constructor() {
      // create Cordova utilities
      this.cordova = new Cordova();

      // Listen for ATOM projects
      atom.workspace["onDidChangeActiveTextEditor"](() => this.fireEditorChanged());
      this.events = new EventEmitter();
    }

    static getInstance() {
        if (!ProjectManager.instance) {
            ProjectManager.instance = new ProjectManager();
        }
        return ProjectManager.instance;
    }

    private fireEditorChanged(){
      var editor = atom.workspace.getActiveTextEditor()
      if (editor){
        var yourPath = editor["getPath"]()
        let projects = atom.project['getPaths']()
        let i = 0;
        let currentProjectPath:string;
        for (i=0;i<projects.length;i++){
          if (yourPath.indexOf(projects[i])==0){
            currentProjectPath = projects[i];
            if (!this.currentProjectPath || currentProjectPath!=this.currentProjectPath){
              this.fireProjectChanged(currentProjectPath);
            }
            break;
          }
        }
      }
    }

    private fireProjectChanged(projectPath:String) {
      this.currentProjectPath = projectPath;
      //console.log("Project changed: ", projectPath);
      this.events.emit('didProjectChanged', projectPath);
    }

    public didProjectChanged(callback:Function){
      this.events.on('didProjectChanged', callback);
    }

    getCurrentProjectPath(): String {
      return this.currentProjectPath;
    }


}
