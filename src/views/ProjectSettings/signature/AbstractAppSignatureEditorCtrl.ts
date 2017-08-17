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
} from '../../../element/index';

import { EventEmitter }  from 'events'
import { Logger } from '../../../logger/Logger'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'

export enum AppType {
  Debug = 1,
  Release = 2
}

export class AbstractAppSignatureEditorCtrl extends UIBaseComponent {

  protected appType:AppType;

  constructor(appType:AppType){
    super();
    this.appType = appType;
    this.initUI();
  }

  protected initUI(){
    let controls = this.createControls();

    let sectionContainer = createElement('div',{
      elements: [ controls ],
      className: 'section-container'
    })

    let mainSection = createElement('div',{
      elements: [ sectionContainer ],
      className: 'section de-wb-signature-editor-crtl-container'
    })

    this.mainElement = mainSection;
  }

  public getApptype():AppType {
    return this.appType;
  }

  protected createBlock(title:string, element:HTMLElement):HTMLElement {
      let block = createElement('div',{
        elements: [
          createElement('label',{
            elements: [createText(title)]
          }),
          element
        ],
        className: 'block control-group'
      })
      return block;
  }

  public destroy(){
      super.destroy();
  }

  protected createControls():Array<HTMLElement> {
    return []
  }

  public reload(){
    // this method must be implemented into the subclass
    throw 'Not implemented'
  }

  public saveChanges(){
    // this method must be implemented into the subclass
    throw 'Not implemented'
  }

}
