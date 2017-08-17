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
import { UIInputFormElement, UISelectFormElement, UIInputWithButtonFormElement, UIInputBrowseForFolderFormElement } from '../../../ui-components/UIInputFormElement'
import { AbstractAppSignatureEditorCtrl, AppType } from './AbstractAppSignatureEditorCtrl'

export class AndroidAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {

  private keystorePath:UIInputBrowseForFolderFormElement;
  private storePasswd:UIInputFormElement;
  private alias:UIInputFormElement;
  private passwd:UIInputFormElement;

  constructor(appType:AppType){
    super(appType);
  }

  protected createControls():Array<HTMLElement> {
    this.passwd = new UIInputFormElement({password: true}).setCaption('Password (keypass)').setPlaceholder('Password (keypass)').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    })

    this.alias = new UIInputFormElement().setCaption('Alias').setPlaceholder('Alias').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    }).chainTo(this.passwd.toChain())

    this.storePasswd = new UIInputFormElement({password: true}).setCaption('Store Password (storepass)').setPlaceholder('Store Password (storepass)').addEventListener('change', (evtCtrl:UIInputFormElement)=>{
    }).chainTo(this.alias.toChain());

    this.keystorePath = new UIInputBrowseForFolderFormElement().setCaption('Keystore Path').setPlaceholder('Keystore Path').chainTo(this.storePasswd.toChain());

    this.passwd.chainTo(this.keystorePath.toChain())

    return [this.keystorePath.element(), this.storePasswd.element(), this.alias.element(), this.passwd.element()];
  }

  public destroy(){
    this.keystorePath.destroy();
    this.storePasswd.destroy();
    this.alias.destroy();
    this.passwd.destroy();
    super.destroy();
  }

  public updateUI(buildJson:any){
    let json = this.getBuildJsonsection('android');
    if (json){
      this.keystorePath.setValue(json.keystore)
      this.storePasswd.setValue(json.storePassword)
      this.alias.setValue(json.alias)
      this.passwd.setValue(json.password)
    }
  }

  public saveChanges(){
    let json = this.getBuildJsonsection('android');
    if (json){
      json.keystore = this.keystorePath.getValue()
      json.storePassword = this.storePasswd.getValue()
      json.alias = this.alias.getValue()
      json.password = this.passwd.getValue()
      json.keystoreType = ""
    }
  }

  public async reload(){
    this.updateUI(this.buildJson);
  }



}
