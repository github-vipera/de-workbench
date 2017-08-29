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

import { UIPane } from '../../ui-components/UIPane'

export class DebugAreaView extends UIPane {

  constructor (params:any) {
    super(params)
  }

  /**
   * Initialize the UI
   */
  protected createUI() {

    // Create the main UI
    let element = createElement('div',{
      elements : [
        createText("Debug Area")
      ]
    });

    return element;
  }


}
