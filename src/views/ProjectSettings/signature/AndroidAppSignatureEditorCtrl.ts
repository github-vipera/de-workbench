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
import { ProjectManager } from '../../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../../cordova/Cordova'
import { Logger } from '../../../logger/Logger'
import { UIPluginsList } from '../../../ui-components/UIPluginsList'
import { UIStackedView } from '../../../ui-components/UIStackedView'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UISelect, UISelectItem, UISelectListener } from '../../../ui-components/UISelect'
import { UIInputFormElement, UISelectFormElement } from '../../../ui-components/UIInputFormElement'
import { AbstractAppSignatureEditorCtrl } from './AbstractAppSignatureEditorCtrl'

export class AndroidAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {

  private keystorePath:UIInputFormElement;
  private storePasswd:UIInputFormElement;
  private alias:UIInputFormElement;
  private passwd:UIInputFormElement;

  constructor(){
    super();
  }

  protected createControls():Array<HTMLElement> {
    this.keystorePath = new UIInputFormElement().setCaption('Keystore Path').setPlaceholder('Keystore Path').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    })
    this.storePasswd = new UIInputFormElement(true).setCaption('Store Password (storepass)').setPlaceholder('Store Password (storepass)').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    })
    this.alias = new UIInputFormElement().setCaption('Alias').setPlaceholder('Alias').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    })
    this.passwd = new UIInputFormElement(true).setCaption('Password (keypass)').setPlaceholder('Password (keypass)').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    })
    return [this.keystorePath.element(), this.storePasswd.element(), this.alias.element(), this.passwd.element()];
  }

  public destroy(){
    this.keystorePath.destroy();
    this.storePasswd.destroy();
    this.alias.destroy();
    this.passwd.destroy();
    super.destroy();
  }

}
