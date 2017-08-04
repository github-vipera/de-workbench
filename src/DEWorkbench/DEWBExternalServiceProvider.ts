'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../logger/Logger'

export class InkProvider {

  private static instance: InkProvider;

  private _ink;

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
  }

  getInk(){
    return this._ink;
  }


}
