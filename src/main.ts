'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const { CompositeDisposable } = require('atom')

import { DEWorkbench } from './DEWorkbench/DEWorkbench'

export default {

  deWorkbench: null,
  toolbarPanel: null,
  subscriptions: null,
  loggerView: null,

  activate (state: any) {
      console.log("DEWB activated.");
      require('atom-package-deps').install('atomify', true).then(function(res){
        console.log("Dep packages installed.");
      })
      this.deWorkbench = new DEWorkbench({
        didToggleToolbar: () => {
            this.toggleToolbar();
        }
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
      this.deWorkbench.destroy();
  },


  toggleProjectInspector(){
    this.deWorkbench.openProjectInspector();
  },

  toggleToolbar() {
    console.log("Toggle toolbar");
    let visible = this.toolbarPanel.visible
    if (visible) {
      this.toolbarPanel.hide()
    } else {
      this.toolbarPanel.show()
    }
  },

  toggleLogger(){
    console.log("Toggle Logger");
    this.deWorkbench.toggleLogger();
  }

}
