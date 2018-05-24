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
import { UIButtonMenu } from '../../../ui-components/UIButtonMenu'

const _  = require('lodash')

export class IOSAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl  {

  private packageTypeSelect:UISelectFormElement;
  private devTeamInput:UIInputFormElement;
  private provisioningProfileInput:UIInputFormElement;
  private btnProvisioningProfilesSelector: UIButtonMenu;
  private codeSignIdentityInput:UIInputFormElement;
  private provisioningProfiles:any;

  constructor(appType:AppType){
    super(appType);
  }

  protected createControls():Array<HTMLElement> {
    this.devTeamInput = new UIInputFormElement().setCaption('Development Team').setPlaceholder('Development Team').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    });
    this.codeSignIdentityInput = new UIInputFormElement().setCaption('Code Sign Identity').setPlaceholder('Code Sign Identity').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    });
    this.provisioningProfileInput = new UIInputFormElement().setCaption('Provisioning Profile ID').setPlaceholder('Provisioning Profile ID').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    }).setExtClassName('control-group-with-button');

    // ============================================================================
    // Provisioning Profile Selector Button
    this.btnProvisioningProfilesSelector = new UIButtonMenu()
                                      .setCaption('Select from list...')
                                      .setInfoMessage('Select a Provisioning Profile')
                                      .setEmptyMessage('  NOTE: Loading Provisioning Profiles...')
                                      .setOnSelectionListener((menuItem)=>{
                                        this.provisioningProfileInput.setValue(menuItem.value);
                                        this.devTeamInput.setValue(menuItem.userData.teamIdentifier[0]);
                                      });
    let btnProvisioningProfilesSelectorDiv = createElement('div',{
      elements: [
        this.btnProvisioningProfilesSelector.element()
      ],
      className: 'select-provisioning-profile-ctrl'
    });

    this.btnProvisioningProfilesSelector.setMenuItems([]);
    this.provisioningProfileInput.element().appendChild(btnProvisioningProfilesSelectorDiv);
    // ============================================================================

    this.packageTypeSelect = new UISelectFormElement().setCaption('Package Type');
    this.packageTypeSelect.setItems(this.getPackageTypeItems());

    return [this.provisioningProfileInput.element(), this.devTeamInput.element(), this.codeSignIdentityInput.element(), this.packageTypeSelect.element()];
  }

  onItemSelected(value) {
    let provisioningProfile = this.getprovisionigProfileByUUID(value);
    //alert(provisioningProfile.teamName);
    this.devTeamInput.setValue(provisioningProfile.teamIdentifier[0]);
    this.devTeamInput.setCaption("Development Team [" + provisioningProfile.teamName +"]");
  }

  private getprovisionigProfileByUUID(uuid:string):any {
    return _.find(this.provisioningProfiles, (obj)=>{
      return obj.data.UUID === uuid;
    });
  }

  private getProvisioningProfileByAppId(appId:string):any {
    return this.provisioningProfiles[appId];
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
    this.packageTypeSelect.destroy();
    this.devTeamInput.destroy();
    this.codeSignIdentityInput.destroy();
    super.destroy();
  }

  public reloadProvisioningProfiles(provisioningProfiles:any){
    this.btnProvisioningProfilesSelector.setEmptyMessage("  NOTE: No provisioning profiles found");
    let values = _.map(provisioningProfiles, (profile)=>{
        return {
          displayName: profile.data.AppIDName,
          value: profile.data.UUID,
          userData: profile
        }
    });
    var sortedValues = _.sortBy(values, (item)=>{
      return item.displayName;
    });
    this.btnProvisioningProfilesSelector.setMenuItems(sortedValues);
  }

  protected refreshProvisioningSelected(toSelect:string){
    alert("TODO!! refreshProvisioningSelected")
    if (toSelect){
      //this.provisioningProfileSelect.setValue(toSelect)
    } else {
      // get saved
      let json = this.getBuildJsonsection('ios');
      if (json){
        //this.provisioningProfileSelect.setValue(json.provisioningProfile)
      }
    }
  }

  protected createItems(provisioningProfiles:any):Array<UISelectItem> {
    let ret = _.map(provisioningProfiles, (item)=>{
        return {
          name: item.data.AppIDName,
          value: item.data.UUID,
          userData: item
        }
    });
    var sortedCollection = _.sortBy(ret, (item)=>{
      return item.name;
    });
    return sortedCollection;
  }

  public updateUI(buildJson:any){
    let json = this.getBuildJsonsection('ios');
    if (json){
      this.provisioningProfileInput.setValue(json.provisioningProfile)
      this.codeSignIdentityInput.setValue(json.codeSignIdentity)
      this.devTeamInput.setValue(json.developmentTeam)
      this.packageTypeSelect.setValue(json.packageType)
    }
  }

  public saveChanges(){
    let json = this.getBuildJsonsection('ios');
    if (json){
      json.provisioningProfile = this.provisioningProfileInput.getValue()
      json.codeSignIdentity = this.codeSignIdentityInput.getValue()
      json.developmentTeam = this.devTeamInput.getValue()
      json.packageType = this.packageTypeSelect.getValue()
    }
  }

  public async reload(){
    this.updateUI(this.buildJson);
  }


}
