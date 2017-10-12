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

export class IOSAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl  {

  private provisioningProfileSelect:UISelectFormElement;
  private packageTypeSelect:UISelectFormElement;
  private devTeamInput:UIInputFormElement;
  private codeSignIdentityInput:UIInputFormElement;
  private provisioningProfiles:any;

  constructor(appType:AppType){
    super(appType);
  }

  protected createControls():Array<HTMLElement> {
    this.devTeamInput = new UIInputFormElement().setCaption('Development Team').setPlaceholder('Development Team').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    })
    this.codeSignIdentityInput = new UIInputFormElement().setCaption('Code Sign Identity').setPlaceholder('Code Sign Identity').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    })
    this.provisioningProfileSelect = new UISelectFormElement().setCaption('Provisioning Profile');
    this.provisioningProfileSelect.getSelectCtrl().addSelectListener(this);
    this.packageTypeSelect = new UISelectFormElement().setCaption('Package Type');
    this.packageTypeSelect.setItems(this.getPackageTypeItems());

    return [this.provisioningProfileSelect.element(), this.devTeamInput.element(), this.codeSignIdentityInput.element(), this.packageTypeSelect.element()];
  }

  onItemSelected(value) {
    let provisioningProfile = this.getProvisioningProfileByAppId(value);
    //alert(provisioningProfile.teamName);
    this.devTeamInput.setValue(provisioningProfile.teamName);
  }

  private getProvisioningProfileByAppId(appId:string):any {
    return this.provisioningProfiles[appId];
    /**
    "appId" : appId,
    "appIdentifier" : appIdentifier,
    "teamIdentifier" : teamIdentifier,
    "teamName" : teamName,
    "data" : data
    **/
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

  public destroy(){
    this.provisioningProfileSelect.destroy();
    this.packageTypeSelect.destroy();
    this.devTeamInput.destroy();
    this.codeSignIdentityInput.destroy();
    super.destroy();
  }

  public reloadProvisioningProfiles(provisioningProfiles:any){
    // save the current value
    let currentProvisioningSelected = this.provisioningProfileSelect.getValue();

    this.provisioningProfiles = provisioningProfiles;
    let items = this.createItems(provisioningProfiles)
    this.provisioningProfileSelect.setItems(items);

    // after the new values probably the selection is changed
    this.refreshProvisioningSelected(currentProvisioningSelected)
  }

  protected refreshProvisioningSelected(toSelect:string){
    if (toSelect){
      this.provisioningProfileSelect.setValue(toSelect)
    } else {
      // get saved
      let json = this.getBuildJsonsection('ios');
      if (json){
        this.provisioningProfileSelect.setValue(json.provisioningProfile)
      }
    }
  }

  protected createItems(provisioningProfiles:any):Array<UISelectItem> {
    return _.map(provisioningProfiles, (item)=>{
        return {
          name: item.appId,
          value: item.appIdentifier,
          userData: item
        }
    })
  }

  public updateUI(buildJson:any){
    let json = this.getBuildJsonsection('ios');
    if (json){
      this.provisioningProfileSelect.setValue(json.provisioningProfile)
      this.codeSignIdentityInput.setValue(json.codeSignIdentity)
      this.devTeamInput.setValue(json.developmentTeam)
      this.packageTypeSelect.setValue(json.packageType)
    }
  }

  public saveChanges(){
    let json = this.getBuildJsonsection('ios');
    if (json){
      json.provisioningProfile = this.provisioningProfileSelect.getValue()
      json.codeSignIdentity = this.codeSignIdentityInput.getValue()
      json.developmentTeam = this.devTeamInput.getValue()
      json.packageType = this.packageTypeSelect.getValue()
    }
  }

  public async reload(){
    this.updateUI(this.buildJson);
  }


}
