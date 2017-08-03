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
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { Logger } from '../../logger/Logger'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UIInputFormElement } from '../../ui-components/UIInputFormElement'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'
import { UINotifications } from '../../ui-components/UINotifications'
import { Shell } from '../../utils/Shell'

export class AppInfoView extends UIBaseComponent {

  private mainFormElement:HTMLElement;
  private nameCtrl: UIInputFormElement;
  private descriptionCtrl: UIInputFormElement;
  private displayName: UIInputFormElement;
  private authorCtrl: UIInputFormElement;
  private licenseCtrl: UIInputFormElement;
  private versionCtrl: UIInputFormElement;
  private currentProjectPath:string;

  private actionButtons:UIButtonGroup;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){

    this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();

    this.nameCtrl = new UIInputFormElement().setCaption('Name').setPlaceholder('name (appId)').addChangeListener((evtCtrl:UIInputFormElement)=>{
      this.onTextValueChanged(evtCtrl);
    })
    this.displayName = new UIInputFormElement().setCaption('Display Name').setPlaceholder('display name').addChangeListener((evtCtrl:UIInputFormElement)=>{
      this.onTextValueChanged(evtCtrl);
    })
    this.descriptionCtrl = new UIInputFormElement().setCaption('Description').setPlaceholder('description').addChangeListener((evtCtrl:UIInputFormElement)=>{
      this.onTextValueChanged(evtCtrl);
    })
    this.authorCtrl = new UIInputFormElement().setCaption('Author').setPlaceholder('author').addChangeListener((evtCtrl:UIInputFormElement)=>{
      this.onTextValueChanged(evtCtrl);
    })
    this.licenseCtrl = new UIInputFormElement().setCaption('License').setPlaceholder('license').addChangeListener((evtCtrl:UIInputFormElement)=>{
      this.onTextValueChanged(evtCtrl);
    })
    this.versionCtrl = new UIInputFormElement().setCaption('Version').setWidth("150px").setPlaceholder('0.0.0').addChangeListener((evtCtrl:UIInputFormElement)=>{
      this.onTextValueChanged(evtCtrl);
    })

    //Action buttons
    this.actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
      .addButton(new UIButtonConfig()
            .setId('revertChanges')
            .setCaption('Revert Changes')
            .setClickListener(()=>{
                this.reload()
            }))
      .addButton(new UIButtonConfig()
            .setId('saveChanges')
            .setButtonType('success')
            .setCaption('Save changes')
            .setClickListener(()=>{
              this.saveChanges()
            }))
    let actionButtonsContainer = createElement('div',{
      elements: [
        this.actionButtons.element()
      ],
      className: 'de-workbench-appinfo-form-action-buttons'
    });

    this.mainFormElement = createElement('form',{
      elements: [
        this.nameCtrl.element(),
        this.displayName.element(),
        this.descriptionCtrl.element(),
        this.authorCtrl.element(),
        this.licenseCtrl.element(),
        this.versionCtrl.element(),
        actionButtonsContainer
      ],
      className: 'de-workbench-appinfo-form general-info-form'
    });


    this.mainFormElement.setAttribute("tabindex", "-1")
    this.mainElement = this.mainFormElement;

    this.reload();
  }

  private async reload(){
    ProjectManager.getInstance().cordova.getProjectInfo(this.currentProjectPath, false).then((ret)=>{
      if (ret==null){
        //This is not a Cordova Project
        return;
      }
      this.nameCtrl.setValue(ret.name);
      this.displayName.setValue(ret.displayName);
      this.descriptionCtrl.setValue(ret.description);
      this.authorCtrl.setValue(ret.author);
      this.licenseCtrl.setValue(ret.license);
      this.versionCtrl.setValue(ret.version);
    });
  }

  private async saveChanges(){
    var currentPackageJson = await ProjectManager.getInstance().cordova.getPackageJson(this.currentProjectPath);
    currentPackageJson.name = this.nameCtrl.getValue();
    currentPackageJson.displayName = this.displayName.getValue();
    currentPackageJson.description = this.descriptionCtrl.getValue();
    currentPackageJson.author = this.authorCtrl.getValue();
    currentPackageJson.license = this.licenseCtrl.getValue();
    currentPackageJson.version = this.versionCtrl.getValue();
    await ProjectManager.getInstance().cordova.storePackageJson(this.currentProjectPath, currentPackageJson);
    UINotifications.showInfo("Project information changes saved successfully.")
  }

  private onTextValueChanged(sourceCtrl:UIInputFormElement){
    console.log("Changed value: ", sourceCtrl.getValue())
  }

}
