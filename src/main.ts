'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const { CompositeDisposable } = require('atom')
declare function require(moduleName: string): any;
//import { DEWorkbench } from './DEWorkbench/DEWorkbench'
import { Logger } from './logger/Logger'
import { InkProvider } from './DEWorkbench/DEWBExternalServiceProvider'

const {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');

export default {

  deWorkbench: null,
  toolbarPanel: null,
  subscriptions: null,
  loggerView: null,
  ink: null,

  activate (state: any) {
      console.log("DEWB activated.");
      setTimeout(this.deferredActivation.bind(this),1000);
  },

  deferredActivation(){
    console.log("DEWB deferredActivation.");

    require('atom-package-deps').install('de-workbench', false).then(function(res){
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
  },

  consumeInk: function (ink) {
    this.ink = ink;
    InkProvider.getInstance().setInk(this.ink);

    /**
    let cons = ink.Console.fromId('dewb-language-client')
    cons.setModes([
      {
        grammar: 'javascript'
      }
    ]);
    cons.open({
      split: 'down',
      searchAllPanes: true
    })

    cons.onEval(function(arg) {
      var editor;
      editor = arg.editor;
      cons.logInput();
      cons.done();
      //console.log(editor.getText())
      //Logger.getInstance().info("Typed ", editor.getText() )
      try {
        let evaluated = null;//eval(editor.getText())
        var docTemplate = allowUnsafeEval(() => allowUnsafeNewFunction(() => evaluated = eval(editor.getText())));
        cons.stdout(evaluated);
        return cons.input();
      } catch (error){
        cons.stderr(error);
        return cons.input();
      }
    });
    **/

  }

}
