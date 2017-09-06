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
 } from '../../element/index';

import { UIDebugBlock } from './UIDebugBlock'

export class DebugWatchExpressionsView extends UIDebugBlock {

  constructor (params:any) {
    super(params)
  }

  /**
   * Initialize the UI
   */
  protected createUIBlock() {

    // Create the main UI
    let element = createElement('div',{
      elements : [
        createText("Watch Expressions")
      ]
    });

    return element;
  }


}
