'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import {
 createText,
 createElement,
 insertElement,
 createGroupButtons,
 createButton,
 createIcon,
 createIconFromPath,
 attachEventFromObject,
 createTextEditor
} from '../element/index';

import { EventEmitter }  from 'events'
import { InkProvider } from '../DEWorkbench/DEWBExternalServiceProvider'

export class ConsoleView {

  constructor () {
  }

  show(){
    if (!InkProvider.getInstance().isAvailable()){
      return; //TODO!! show a wraning
    }
  }

  hide(){
    if (!InkProvider.getInstance().isAvailable()){
      return; //TODO!! show a wraning
    }
    //this.cons.hide()
  }

  isAvailabe():boolean{
    return InkProvider.getInstance().isAvailable();
  }

}
