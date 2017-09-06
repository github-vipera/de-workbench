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

import { EventEmitter }  from 'events'
import { UIPane } from '../../ui-components/UIPane'

export class UIDebugBlock extends UIPane {

  constructor (params:any) {
    super(params)
  }

  /**
   * Initialize the UI
   */
  protected createUI() {

    let content = this.createUIBlock();

    // Create the main UI
    let element = createElement('div',{
      elements : [
        content
      ],
      className: 'de-workbench-debug-area-block-container'
    });

    return element;
  }

  protected createUIBlock():HTMLElement {
    throw ("Invalid implementation. Override this method in subclass.")
  }

}
