'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../logger/Logger'

const {allowUnsafeEval, allowUnsafeNewFunction} = require('loophole');

export class InkProvider {

  private static instance: InkProvider;

  private _ink;
  private _cons;

  private constructor() {

  }

  static getInstance() {
      if (!InkProvider.instance) {
          InkProvider.instance = new InkProvider();
      }
      return InkProvider.instance;
  }

  setInk(ink){
    this._ink = ink;
    this.createConsole()
  }

  getInk(){
    return this._ink;
  }

  isAvailable(){
    return (this._ink!=null)
  }

  protected createConsole(){
    this._cons = InkProvider.getInstance().getInk().Console.fromId('dewb-language-client')
    this._cons.setModes([
      {name: 'DE Workbench Console', default: true, grammar: 'source.javascript'}
    ]);

    let cons = this._cons;

    this._cons.onEval((arg)=>{
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
        cons.stderr("Errorone!!!")
        return cons.input();
      } catch (error){
        cons.stderr(error);
        return cons.input();
      }
    });

    this._cons.open({
      split: 'down',
      searchAllPanes: false
    })
  }

  public getConsole(){
    return this._cons;
  }

}
