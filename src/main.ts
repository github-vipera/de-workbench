
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const { Logger } = require( './logger/Logger')
const { ConsumedServices } = require ('./DEWorkbench/ConsumedServices')
const { InkProvider } = require('./DEWorkbench/DEWBExternalServiceProvider')
const { CompositeDisposable } = require('atom')

module.exports = {

  deWorkbench: null,
  toolbarPanel: null,
  subscriptions: null,
  loggerView: null,
  ink: null,
  cordovaPluginsProvidersManager:null,

  activate (state: any) {
      setTimeout(this.deferredActivation.bind(this),100);
  },

  async deferredActivation(){
    Logger.consoleLog("DEWB deferredActivation.");
    await require('atom-package-deps').install('de-workbench', false).then(function(res){
      Logger.consoleLog("Dep packages installed.");
    })


    let DEWorkbenchClass = require('./DEWorkbench/DEWorkbench').DEWorkbench;
    this.deWorkbench = new DEWorkbenchClass({
    });

    let value = 'HeaderPanel';
    this.toolbarPanel = atom.workspace[`add${value}`]({
      item: this.deWorkbench.getToolbarElement()
    });

    // add commands
    let commands = atom.commands.add('atom-workspace', {
        'dewb-menu-view-:toolbar-toggle': () => this.toggleToolbar(),
        'dewb-menu-view-:prjinspector-toggle': () => this.showProjectSettings(),
        'dewb-menu-view-:pushtool-show': () => this.showPushTool(),
        'dewb-menu-view-:servers-show':()=> this.deWorkbench.viewManager.openView(this.viewManagerClass().VIEW_SERVERS),
        'dewb-menu-view-:bookmarks-toggle':()=> this.deWorkbench.viewManager.openView(this.viewManagerClass().VIEW_BOOKMARKS),
        'dewb-menu-view-:loggerview-toggle': () => this.toggleLogger()
      });
    this.subscriptions = new CompositeDisposable();
    // add commands subs
    this.subscriptions.add(commands);

    this.serverManagerInstance()
    this.cordovaPluginsProvidersManager = this.cordovaPluginsProvidersManagerInstance();// CordovaPluginsProvidersManager.getInstance();

    //this.checkForDECli(); move this on extension plugin!
  },

  deactivate () {
    Logger.consoleLog('DEWB deactivated.');
    if(this.deWorkbench){
      this.deWorkbench.destroy();
    }
  },

  
  showPushTool(){
    let currentprojectPath:string = this.projectManagerInstance().getCurrentProjectPath();
    if (currentprojectPath){
      this.deWorkbench["viewManager"].openView(this.viewManagerClass.VIEW_PUSHTOOLS(currentprojectPath));
    }
  },
  

  showProjectSettings(){
    this.deWorkbench.showProjectSettings();
  },

  toggleToolbar() {
    Logger.consoleLog("Toggle toolbar");
    this.deWorkbench.toggleToolbar()
  },

  toggleLogger(){
    Logger.consoleLog("Toggle Logger");
    this.deWorkbench.toggleLogger();
  },

  consumeInk: function (ink) {
    ConsumedServices.ink = ink;
    this.ink = ink;
  },

  provideCordovaPluginsProvider () {
    Logger.consoleLog("consumeDEWBCordovaPluginsProvider called")
    return this.cordovaPluginsProvidersManagerInstance();
  },

  provideLogger () {
    Logger.consoleLog("consumeLogger called")
    return Logger.getInstance();
  },

  provideProjectManager() {
    Logger.consoleLog("provideProjectManager called")
    return this.projectManagerInstance();
  },

  provideEventBus() {
    Logger.consoleLog("provideEventBus called")
    return this.eventBusInstance();
  },

  provideServerManager(){
    Logger.consoleLog("provideServerManager called")
    return this.serverManagerInstance();
  },

  provideExecutorService(){
    Logger.consoleLog("provideExecutorService called")
    return this.executorServiceInstance();
  },

  executorServiceInstance():any{
    return require('./DEWorkbench/services/ExecutorService').ExecutorService.getInstance();
  },

  projectManagerInstance():any{
    return require('./DEWorkbench/ProjectManager').ProjectManager.getInstance();
  },

  serverManagerInstance():any{
    return require('././DEWorkbench/services/ServerManager').ServerManager.getInstance();
  },

  eventBusInstance():any{
    return require('./DEWorkbench/EventBus').EventBus.getInstance();
  },

  viewManagerClass():any{
    return require('./DEWorkbench/ViewManager').ViewManager;
  },

  cordovaPluginsProvidersManagerInstance():any {
    return require('./DEWorkbench/services/CordovaPluginsProvidersManager').CordovaPluginsProvidersManager.getInstance();
  }

}

