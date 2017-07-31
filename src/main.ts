'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const { CompositeDisposable } = require('atom')
declare function require(moduleName: string): any;
//import { DEWorkbench } from './DEWorkbench/DEWorkbench'

export default {

  deWorkbench: null,
  toolbarPanel: null,
  subscriptions: null,
  loggerView: null,

  activate (state: any) {
      console.log("DEWB activated.");
      setTimeout(this.deferredActivation.bind(this),1000);
  },

  deferredActivation(){
    console.log("DEWB deferredActivation.");
    require('atom-package-deps').install('atomify', true).then(function(res){
      console.log("Dep packages installed.");
    })
    let DEWorkbenchClass = require('./DEWorkbench/DEWorkbench').DEWorkbench;
    this.deWorkbench = new DEWorkbenchClass({
    });
    window["deWorkbench"] = this.deWorkbench; //make it public only for debugging purpose

    let value = 'HeaderPanel';
    this.toolbarPanel = atom.workspace[`add${value}`]({
      item: this.deWorkbench.getToolbarElement()
    });

    // add commands
    let commands = atom.commands.add('atom-workspace', {
        'dewb-menu-view-:toolbar-toggle': () => this.toggleToolbar(),
        'dewb-menu-view-:prjinspector-toggle': () => this.toggleProjectInspector(),
        'dewb-menu-view-:loggerview-toggle': () => this.toggleLogger()
      });
    this.subscriptions = new CompositeDisposable();
    // add commands subs
    this.subscriptions.add(commands);
  },

  deactivate () {
      console.log('DEWB deactivated.');
      if(this.deWorkbench){
        this.deWorkbench.destroy();
      }
  },


  toggleProjectInspector(){
    this.deWorkbench.openProjectInspector();
  },

  toggleToolbar() {
    console.log("Toggle toolbar");
    this.deWorkbench.toggleToolbar()
  },

  toggleLogger(){
    console.log("Toggle Logger");
    this.deWorkbench.toggleLogger();
  }

}
