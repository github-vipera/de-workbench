'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { EventEmitter }  from 'events'
import { Cordova } from '../cordova/Cordova'
import { Logger } from '../logger/Logger'
import { EventBus } from '../DEWorkbench/EventBus'
import { ProjectSettings } from './ProjectSettings'


export class ProjectManager {

    private static instance: ProjectManager;
    private currentProjectPath: string;
    private events: EventEmitter;
    public cordova: Cordova;
    private projectSettings:{};

    private constructor() {
      Logger.getInstance().debug("ProjectManager initializing...");
      this.events = new EventEmitter();
      this.projectSettings = {};

      // create Cordova utilities
      this.cordova = new Cordova();

      // By default use the first project root
      this.currentProjectPath = this.getFirstAvailableProjectRootFolder();
      if (this.currentProjectPath){
        this.fireProjectChanged(this.currentProjectPath);
      }

      // Listen for ATOM projects
      //atom.workspace["onDidChangeActiveTextEditor"](() => this.fireEditorChanged());
      atom.workspace["onDidChangeActivePaneItem"](() => this.fireEditorChanged());
      atom.workspace["onDidOpen"](() => this.fireEditorChanged());
      atom.project["onDidChangePaths"](() => this.firePathChanged());
    }

    static getInstance() {
        if (!ProjectManager.instance) {
            ProjectManager.instance = new ProjectManager();
        }
        return ProjectManager.instance;
    }

    private firePathChanged(){
      this.events.emit('didPathChanged');
      Logger.consoleLog("firePathChanged");
      let ok = this.fireEditorChanged();
      if (!ok){
          this.currentProjectPath = this.getFirstAvailableProjectRootFolder();
          if (this.currentProjectPath){
            this.fireProjectChanged(this.currentProjectPath);
          }
      }
    }

    getFirstAvailableProjectRootFolder(){
      let currentPaths = atom.project["getPaths"]();
      if (currentPaths && currentPaths.length>0){
        return atom.project["getPaths"]()[0];
      }
      return undefined;
    }

    getAllAvailableProjects():Array<any>{
      let currentPaths = atom.project["getPaths"]();
      if(currentPaths){
        return currentPaths;
      }else{
        return [];
      }
    }

    /**
     * Return true if an editore opened and selected is available
     */
    private fireEditorChanged():boolean{
      Logger.consoleLog("fireEditorChanged")
      var editor = atom.workspace.getActiveTextEditor()
      if (editor){
        var yourPath = editor["getPath"]()
        let projects = atom.project['getPaths']()
        if (projects==undefined || projects.length==0){
          return false;
        }
        let i = 0;
        let currentProjectPath:string;
        for (i=0;i<projects.length;i++){
          if (yourPath && yourPath.indexOf(projects[i])==0){
            currentProjectPath = projects[i];
            if (!this.currentProjectPath || currentProjectPath!=this.currentProjectPath){
              this.fireProjectChanged(currentProjectPath);
            }
            break;
          }
        }
        return true;
      }
      return false;
    }

    private fireProjectChanged(projectPath:string) {
      this.currentProjectPath = projectPath;
      //Logger.consoleLog("Project changed: ", projectPath);
      this.events.emit('didProjectChanged', projectPath);
    }

    public didProjectChanged(listener){
      this.events.on('didProjectChanged', listener);
      EventBus.getInstance().publish(EventBus.EVT_PROJECT_CHANGED, this.currentProjectPath)
    }

    public didPathChanged(listener){
      this.events.on('didPathChanged', listener);
      EventBus.getInstance().publish(EventBus.EVT_PATH_CHANGED, this.currentProjectPath)
    }

    public getCurrentProjectPath(): string {
      if (!this.currentProjectPath){
        this.currentProjectPath = this.getFirstAvailableProjectRootFolder();
      }
      return this.currentProjectPath;
    }

    public getProjectSettings(projectPath:string):Promise<ProjectSettings> {
      return new Promise((resolve,reject)=>{
        let ret:ProjectSettings = this.projectSettings[projectPath];
        if (!ret){
          ret = new ProjectSettings(projectPath)
          ret.load().then((settings)=>{
            Logger.consoleLog("getProjectSettings load done!")
            this.projectSettings[projectPath] = ret;
            resolve(settings);
          },(err) => {
            reject(err);
          }).catch((ex) => {
            reject(ex);
          });
        } else {
          resolve(ret);
        }
      });
    }



}
