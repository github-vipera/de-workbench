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
import { TaskExecutor} from '../tasks/TaskExecutor'
import { UIIndicatorStatus } from '../ui-components/UIStatusIndicatorComponent'
import { ServersView }from '../views/Servers/ServersView'

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
   private taskExecutor:TaskExecutor;
   private taskConfiguration:CordovaTaskConfiguration;
   public serversView: ServersView

   constructor(options:WorkbenchOptions){
     Logger.getInstance().info("Initializing DEWorkbench...");

     //let cu = new CordovaUtils();

     this.projectManager = ProjectManager.getInstance();

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
      didStop:() => {
        this.onStopTask();
      },
      didRun : () => {
        this.onTaskRunRequired(this.taskConfiguration);
      }
     });

     // Create the Logger inspector
     //this.loggerView = new LoggerView();

     //this.debugAreaView = new DebugAreaView();

     attachEventFromObject(this.events, [
       'didToggleToolbar'
     ], options);

     ProjectManager.getInstance().didProjectChanged((projectPath)=>this.onProjectChanged(projectPath));
     //this.events.on('didStop',this.onStopTask.bind(this));
     this.events.on('didRunTask',this.onTaskRunRequired.bind(this));
     Logger.getInstance().info("DEWorkbench initialized successfully.");
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

   openLogger(){
     if (!this.loggerView){
       this.loggerView = new LoggerView();
     }
     this.loggerView.open();
   }

   showProjectSettings() {
     Logger.getInstance().debug("DEWorkbench showProjectSettings called");
     let currentprojectPath:string = this.projectManager.getCurrentProjectPath();
     if (currentprojectPath){
       let projectSettingsView = new ProjectSettingsView(currentprojectPath);
       projectSettingsView.open();
     }
   }

   openServersView(){
     Logger.getInstance().debug("DEWorkbench showPushTool called");
     let currentprojectPath:string = this.projectManager.getCurrentProjectPath();
     if (currentprojectPath){
       let serversView = new ServersView(currentprojectPath);
       serversView.open();
     }
   }

   openPushTool(){
     Logger.getInstance().debug("DEWorkbench showPushTool called");
     let currentprojectPath:string = this.projectManager.getCurrentProjectPath();
     if (currentprojectPath){
       let pushToolView = new PushToolView(currentprojectPath);
       pushToolView.open();
     }
   }

   toggleToolbar() {
     this.toolbarView.toggle();
   }

   toggleDebugArea(){
     Logger.getInstance().debug("DEWorkbench toggleDebugArea called");
     this.events.emit('didToggleDebugArea');
     this.openDebugArea();
   }

   toggleLogger(){
     Logger.getInstance().debug("DEWorkbench toggleLogger called");
     this.events.emit('didToggleLogger');
     this.openLogger();
   }

   getToolbarElement() {
       return this.toolbarView.getElement();
   }

   async showCordovaTaskModal(){
     console.log("showCordovaTaskModal");
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
     this.getTaskExecutor().executeTask(taskConfiguration,project).then(() => {
       //this.toolbarView.setSuccessStatus(`${taskConfiguration.displayName} - ${platform} Done`);
       Logger.getInstance().info(`${taskConfiguration.displayName} Done`);
       this.updateToolbarStatus(taskConfiguration,true);
     },(reason) => {
        //this.toolbarView.setErrorStatus(`${taskConfiguration.displayName} - ${platform} Fail`);
        Logger.getInstance().error(reason);
        this.updateToolbarStatus(taskConfiguration,false);
     }).catch((err:Error) => {
       //this.toolbarView.setErrorStatus(`${taskConfiguration.displayName} - ${platform} Fail`);
       Logger.getInstance().error(err.message, err.stack);
       this.updateToolbarStatus(taskConfiguration,false);
     });
   }

   onStopTask(){
     console.log("onStopTask");
     if(this.taskExecutor){
       this.taskExecutor.stop();
       this.updateToolbarStatus(this.taskConfiguration,false);
     }
   }

   private updateToolbarStatus(taskConfiguration:CordovaTaskConfiguration,taskDone?:boolean){
     let project = this.selectedProjectForTask;
     let platform = taskConfiguration.selectedPlatform ? taskConfiguration.selectedPlatform.name : "";
     if(this.taskExecutor){
       let busy = this.taskExecutor.isBusy();
       let serverRunning = this.taskExecutor.isPlatformServerRunning();
       if(busy){
         this.toolbarView.setInProgressStatus(`${taskConfiguration.displayName} - ${platform}  in progress...`);
         return;
       }
       if(serverRunning){
         if(taskDone){
           this.toolbarView.updateStatus({
             prjSelectorEnable:false,
             btnStopEnable:true,
             btnRunEnable:true,
             btnReloadEnable:true,
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
             progressIcon: 'status-error',
             progressStatus: UIIndicatorStatus.Error,
             progressMsg : `${taskConfiguration.displayName} - ${platform} Fail (Server running)`
           });
         }
       }else{
         if(taskDone){
            this.toolbarView.setSuccessStatus(`${taskConfiguration.displayName} - ${platform} Done`);
         }else{
            this.toolbarView.setErrorStatus(`${taskConfiguration.displayName} - ${platform} Fail`);
         }
       }
     }
   }


   getTaskExecutor():TaskExecutor{
     if(!this.taskExecutor){
       this.taskExecutor = new TaskExecutor();
     }
     return this.taskExecutor;
   }

   destroy () {
     // destroy all
     Logger.getInstance().info("DEWorkbench destroying...");
   }

}
