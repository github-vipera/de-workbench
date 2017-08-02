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

export class AppInfoView extends UIBaseComponent {

  private mainFormElement:HTMLElement;
  private nameCtrl: UIInputFormElement;
  private descriptionCtrl: UIInputFormElement;
  private displayName: UIInputFormElement;
  private authorCtrl: UIInputFormElement;
  private licenseCtrl: UIInputFormElement;
  private versionCtrl: UIInputFormElement;
  private currentProjectPath:string;

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

    this.mainFormElement = createElement('form',{
      elements: [
        this.nameCtrl.element(),
        this.displayName.element(),
        this.descriptionCtrl.element(),
        this.authorCtrl.element(),
        this.licenseCtrl.element(),
        this.versionCtrl.element()
      ],
      className: 'de-workbench-appinfo-form'
    });
    this.mainFormElement.setAttribute("tabindex", "-1")
    this.mainElement = this.mainFormElement;


  }

  private onTextValueChanged(sourceCtrl:UIInputFormElement){
    console.log("Changed value: ", sourceCtrl.getValue())
  }

}
