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
import { UISelect, UISelectItem, UISelectListener } from '../../../ui-components/UISelect'
import { UIInputFormElement, UISelectFormElement } from '../../../ui-components/UIInputFormElement'
import { AbstractAppSignatureEditorCtrl, AppType } from './AbstractAppSignatureEditorCtrl'
import { IOSUtilities } from '../../../cordova/IOSUtilities'

const _  = require('lodash')

export class IOSAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {

  private provisioningProfileSelect:UISelectFormElement;
  private packageTypeSelect:UISelectFormElement;
  private devTeamInput:UIInputFormElement;
  private codeSignIdentityInput:UIInputFormElement;

  constructor(appType:AppType){
    super(appType);
  }

  protected createControls():Array<HTMLElement> {
    this.devTeamInput = new UIInputFormElement().setCaption('Development Team').setPlaceholder('Development Team').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    })
    this.codeSignIdentityInput = new UIInputFormElement().setCaption('Code Sign Identity').setPlaceholder('Code Sign Identity').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    })
    this.provisioningProfileSelect = new UISelectFormElement().setCaption('Provisioning Profile');
    this.packageTypeSelect = new UISelectFormElement().setCaption('Package Type');
    this.packageTypeSelect.setItems(this.getPackageTypeItems());

    return [this.provisioningProfileSelect.element(), this.devTeamInput.element(), this.codeSignIdentityInput.element(), this.packageTypeSelect.element()];
  }

  protected getPackageTypeItems():Array<UISelectItem>{
    return [
        { value: "developement",
          name: "Developement"
        },
        { value: "adhoc",
          name: "Ad-Hoc"
        },
        { value: "enterprise",
          name: "Enterprise"
        },
        { value: "appstore",
          name: "AppStore"
        }
    ]
  }

  /**
  public async reload(){
    // this method must be implemented into the subclass
    let provFiles = await IOSUtilities.loadProvisioningProfiles();
    console.log("Obtained Provisioning profiles: ", provFiles)
  }

  public saveChanges(){
    // this method must be implemented into the subclass
    throw 'Not implemented'
  }
  **/

  public destroy(){
    this.provisioningProfileSelect.destroy();
    this.packageTypeSelect.destroy();
    this.devTeamInput.destroy();
    this.codeSignIdentityInput.destroy();
    super.destroy();
  }

  public reloadProvisioningProfiles(provisioningProfiles:any){
    let items = this.createItems(provisioningProfiles)
    this.provisioningProfileSelect.setItems(items);
  }

  protected createItems(provisioningProfiles:any):Array<UISelectItem> {
    return _.map(provisioningProfiles, (item)=>{
        return {
          name: item.appId,
          value: item.appIdentifier
        }
    })
  }

}
