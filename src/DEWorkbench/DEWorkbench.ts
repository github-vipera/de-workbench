'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { ToolbarView } from '../toolbar/ToolbarView'
import { NewProjectView } from '../views/NewProject/NewProjectView'
import { EventEmitter }  from 'events';
const  { CompositeDisposable } = require('atom');
import { DebugAreaView }from '../views/DebugAreaView'
import { CordovaUtils } from '../cordova/CordovaUtils'
import { ProjectManager } from '../DEWorkbench/ProjectManager'
import { Logger } from '../logger/Logger'
import { ProjectSettingsView } from '../views/ProjectSettings/ProjectSettingsView'
import { PushToolView } from '../views/PushTool/PushToolView'
import { LoggerView } from '../views/LoggerView'
import { TaskConfigView } from '../views/TaskConfig/TastConfigView'
import { CordovaProjectInfo } from '../cordova/Cordova'
import { CordovaTaskConfiguration } from '../cordova/CordovaTasks'
import { TaskManager} from '../tasks/TaskManager'
import { UIIndicatorStatus } from '../ui-components/UIStatusIndicatorComponent'
import { ServersView }from '../views/Servers/ServersView'
import { BookmarkManager } from './BookmarkManager'
import { BookmarksView } from '../views/Bookmarks/BookmarksView'
import { ViewManager } from './ViewManager'

 import {
   createText,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject
 } from '../element/index';

 export interface WorkbenchOptions {
   didToggleToolbar?: Function,
   didToggleDebugArea?:Function,
   didProjectSettings?:Function,
   didToggleConsole?:Function
 }


 export class DEWorkbench {

   public toolbarView: ToolbarView
   public debugAreaView: DebugAreaView
   public loggerView: LoggerView
   private events: EventEmitter;
   public projectManager: ProjectManager;
   public selectedProjectForTask: CordovaProjectInfo;
   private taskManager:TaskManager;
   private taskConfiguration:CordovaTaskConfiguration;
   public serversView: ServersView
   private updateToolbarTimeout:any;
   private _viewManager:ViewManager;
   private static _instance:DEWorkbench;

   constructor(options:WorkbenchOptions){
     Logger.getInstance().info("Initializing DEWorkbench...");

     this._viewManager = new ViewManager()

     this.projectManager = ProjectManager.getInstance();

     BookmarkManager.getInstance();

     this.events = new EventEmitter();

     // Create the main toolbar
     this.toolbarView = new ToolbarView({
       didNewProject: () => {
         this.showNewProjectModal();
      },
      didToggleToolbar: () => {
          this.toggleToolbar();
      },
      didToggleDebugArea: () => {
        this.toggleDebugArea();
      },
      didProjectSettings: () => {
          this.showProjectSettings();
      },
      didToggleConsole:() => {
        this.toggleLogger();
      },
      didSelectProjectForRun: (projectInfo:CordovaProjectInfo) => {
        console.log("didSelectProjectForRun",projectInfo);
        this.selectedProjectForTask = projectInfo;
      },
      didSelectTaskClick: () => {
        console.log("didSelectTaskClick");
        this.showCordovaTaskModal();
      },
      didTaskSelected:(task:CordovaTaskConfiguration) => {
        this.onTaskSelected(task);
      },
      didStop:() => {
        this.onStopTask();
      },
      didRun : () => {
        this.onTaskRunRequired(this.taskConfiguration);
      },
      didReload : () => {
        console.log('Reload');
        this.getTaskManager().sendAction({
          type: 'doLiveReload'
        });
      },
      didOpenJSConsole: () => {
        console.log('didOpenJSConsole');
        let runtimeHandler=this.getTaskManager().getRuntimeSessionHandler();
        if(runtimeHandler && runtimeHandler.canOpenJSSession()){
          let consoleHandler = runtimeHandler.openConsole();
        }
      }
     });

     /**
     atom.workspace['observeActivePaneItem']((editor) => {
      if (editor) {
        let range = [[1, 0], [1, 0]]
        let marker = editor.markBufferRange(range)
        let decorator = editor.decorateMarker(marker, {
          type: 'line-number',
          class: 'bugs-breakpoint'
        })
        //this.editorManager.addFeatures(editor)
      }
    })
    **/


     attachEventFromObject(this.events, [
       'didToggleToolbar'
     ], options);

     ProjectManager.getInstance().didProjectChanged((projectPath)=>this.onProjectChanged(projectPath));
     //this.events.on('didStop',this.onStopTask.bind(this));
     this.events.on('didRunTask',this.onTaskRunRequired.bind(this));
     this.events.on('didTaskSelected',this.onTaskSelected.bind(this));
     this.events.on('didStoreTasks',this.onStoreTasks.bind(this));

     DEWorkbench._instance = this;

     Logger.getInstance().info("DEWorkbench initialized successfully.");
   }

   public static get default():DEWorkbench {
     return this._instance;
   }

   public showNewProjectModal(){
     // Create the New Project modal window
     let newProjectView = new NewProjectView();
     newProjectView.open();
   }

   onProjectChanged(projectPath:String){
     Logger.getInstance().debug("DEWorkbench onProjectChanged: ", projectPath);
   }

   openProjectInspector(){
   }



   openDebugArea(){
     if (!this.debugAreaView){
       this.debugAreaView = new DebugAreaView();
     }
     this.debugAreaView.open();
   }


   showProjectSettings() {
     let currentprojectPath:string = ProjectManager.getInstance().getCurrentProjectPath();
     if (currentprojectPath){
       this.viewManager.openView(ViewManager.VIEW_PROJECT_SETTINGS(currentprojectPath));
     }
   }

   toggleToolbar() {
     this.toolbarView.toggle();
   }

   toggleDebugArea(){
     this.events.emit('didToggleDebugArea');
     this.openDebugArea();
   }

   toggleLogger(){
     this.events.emit('didToggleLogger');
     this.viewManager.toggleView(ViewManager.VIEW_LOG_INSPECTOR)
   }

   getToolbarElement() {
       return this.toolbarView.getElement();
   }

   async showCordovaTaskModal(){
     if(this.selectedProjectForTask == null){
       Logger.getInstance().warn("select project before run task");
       return;
     }
     let taskConfigView:TaskConfigView = new TaskConfigView("Task Configuration",this.events);
     // RELOAD PROJECT INFO
     this.selectedProjectForTask = await this.projectManager.cordova.getProjectInfo(this.selectedProjectForTask.path,false);
     taskConfigView.setProject(this.selectedProjectForTask);
     taskConfigView.show();
   }

   onStoreTasks(taskConfiguration:CordovaTaskConfiguration){
     if(taskConfiguration){
       this.onTaskSelected(taskConfiguration,true);
     }
   }

   onTaskSelected(taskConfiguration:CordovaTaskConfiguration,forceUpdate?:boolean){
     console.log("onTaskSelected",taskConfiguration);
     this.taskConfiguration = taskConfiguration;
     if(!taskConfiguration){
       Logger.getInstance().warn("Null task selected");
       this.toolbarView.setTaskConfiguration(null);
       return;
     }
     if(forceUpdate){
       this.toolbarView.setTaskConfiguration(taskConfiguration);
     }
   }

   onTaskRunRequired(taskConfiguration:CordovaTaskConfiguration){
     console.log("onTaskRunRequired",taskConfiguration);
     this.taskConfiguration = taskConfiguration;
     if(!taskConfiguration){
       Logger.getInstance().warn("Null task selected");
       this.toolbarView.setTaskConfiguration(null);
       return;
     }
     Logger.getInstance().info("Require execute of task", taskConfiguration.name, this.selectedProjectForTask);
     this.toolbarView.setTaskConfiguration(taskConfiguration);
     let project = this.selectedProjectForTask;
     let platform = taskConfiguration.selectedPlatform ? taskConfiguration.selectedPlatform.name : "";
     this.toolbarView.setInProgressStatus(`${taskConfiguration.displayName} - ${platform}  in progress...`);
     this.getTaskManager().executeTask(taskConfiguration,project).then(() => {
       this.cancelUpdateTimer();
       Logger.getInstance().info(`${taskConfiguration.displayName} Done`);
       this.updateToolbarStatus(taskConfiguration,true);
     },(reason) => {
        this.cancelUpdateTimer();
        Logger.getInstance().error(reason);
        this.updateToolbarStatus(taskConfiguration,false);
     }).catch((err:Error) => {
       this.cancelUpdateTimer();
       Logger.getInstance().error(err.message, err.stack);
       this.updateToolbarStatus(taskConfiguration,false);
     });
     // schedule update for task start
     this.setUpdateTimer(taskConfiguration);
   }

   private setUpdateTimer(taskConfiguration:CordovaTaskConfiguration){
     this.updateToolbarTimeout=setTimeout(() => {
       console.warn("updateToolbarStatus");
       this.updateToolbarStatus(taskConfiguration,false);
       this.updateToolbarTimeout = null;
     },4000);
   }

   private cancelUpdateTimer(){
     clearTimeout(this.updateToolbarTimeout);
     this.updateToolbarTimeout = null;
   }


   onStopTask(){
     console.log("onStopTask");
     if(this.taskManager){
       this.taskManager.stop();
       this.updateToolbarStatus(this.taskConfiguration,false);
     }
   }

   private updateToolbarStatus(taskConfiguration:CordovaTaskConfiguration,taskDone?:boolean){
     let project = this.selectedProjectForTask;
     let platform = taskConfiguration.selectedPlatform ? taskConfiguration.selectedPlatform.name : "";
     if(this.taskManager){
       let busy = this.taskManager.isBusy();
       let serverRunning = this.taskManager.isPlatformServerRunning();
       console.log(`updateToolbarStatus busy ${busy} -  serverRunning ${serverRunning}`);
       if(busy){
         this.toolbarView.setInProgressStatus(`${taskConfiguration.displayName} - ${platform}  in progress...`);
         if(serverRunning){
           this.toolbarView.updateStatus({
             btnReloadEnable:true,
             btnOpenJSConsoleEnable:true,
           });
         }
         return;
       }
       if(serverRunning){
         if(taskDone){
           this.toolbarView.updateStatus({
             prjSelectorEnable:false,
             btnStopEnable:true,
             btnRunEnable:true,
             btnReloadEnable:true,
             btnOpenJSConsoleEnable:true,
             progressStatus: UIIndicatorStatus.Busy,
             progressIcon: 'status-success',
             progressMsg : 'Server running'
           })
         }else{
           this.toolbarView.updateStatus({
             prjSelectorEnable:false,
             btnRunEnable:true,
             btnStopEnable:true,
             btnReloadEnable:false,
             btnOpenJSConsoleEnable:false,
             progressIcon: 'status-error',
             progressStatus: UIIndicatorStatus.Error,
             progressMsg : `${taskConfiguration.displayName} - ${platform} Fail (Server running)`
           });
         }
       }else{
         this.toolbarView.updateStatus({
           btnReloadEnable:false,
           btnOpenJSConsoleEnable:false,
         });
         if(taskDone){
            this.toolbarView.setSuccessStatus(`${taskConfiguration.displayName} - ${platform} Done`);
         }else{
            this.toolbarView.setErrorStatus(`${taskConfiguration.displayName} - ${platform} Fail`);
         }
       }
     }
   }


   getTaskManager():TaskManager{
     if(!this.taskManager){
       this.taskManager = new TaskManager();
     }
     return this.taskManager;
   }

   destroy () {
     // destroy all
     Logger.getInstance().info("DEWorkbench destroying...");
   }

   public get viewManager():ViewManager {
     return this._viewManager;
   }

}
