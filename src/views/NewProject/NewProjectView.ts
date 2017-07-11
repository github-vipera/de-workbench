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
   createTextEditor,
   createControlBlock,
   createLabel,
   createBlock,
   createModalActionButtons
 } from '../../element/index';

import { EventEmitter }  from 'events'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'
import { NewProjectTypeSelector } from './NewProjectTypeSelector'
import { Cordova, NewProjectInfo } from '../../cordova/Cordova'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { NewProjectProgressPanel } from './NewProjectProgressPanel'
import { UINotifications } from '../../ui-components/UINotifications'

const remote = require('remote');
const dialog = remote.require('electron').dialog;
const path = require("path");


export class NewProjectView {

  private readonly TXT_PROJECT_NAME:string = 'deweb-new-project-name'
  private readonly TXT_PROJECT_PACKAGE_ID:string = 'deweb-new-package-id'
  private readonly TXT_PROJECT_PATH:string = 'deweb-new-project-path'

  private element: HTMLElement
  private events: EventEmitter
  private panel: any

  private projectPlatformButtons: UIButtonGroup;
  private actionButtons:UIButtonGroup;
  private projectTemplateSection:HTMLElement;
  private newProjectTypeSelector:NewProjectTypeSelector;

  private newProjectProgressPanel:NewProjectProgressPanel;

  // Process Log Panel
  private logOverlayElement:HTMLElement;

  private modalContainer:HTMLElement;

  constructor () {
    this.events = new EventEmitter()

    this.modalContainer = createElement('div', {
      className : 'de-workbench-modal-container'
    })

    // Watermark Icon
    let watermarkEl = createElement('div',{
      className: 'de-workbench-modal-watermark'
    });
    insertElement(this.modalContainer, watermarkEl);

    // Modal Title
    let title =  createElement('div', {
        elements: [createText('New Dynamic Engine Project')],
        className : 'de-workbench-modal-title'
    })
    insertElement(this.modalContainer, title)


    // Project name
    let projectName = this.createTextControlBlock(this.TXT_PROJECT_NAME,'Project Name', 'Your project name');
    insertElement(this.modalContainer, projectName);


    // Project package id
    let packageID = this.createTextControlBlock(this.TXT_PROJECT_PACKAGE_ID ,'Package ID', 'Your project package ID (ex: com.yourcompany.yourapp)');
    insertElement(this.modalContainer, packageID);


    // Project path
    let buttonListener = ()=>{ this.chooseFolder() }
    let projectPath = this.createTextControlBlockWithButton(this.TXT_PROJECT_PATH, 'Destination Path', 'Your project path', 'Choose Folder...', buttonListener)
    insertElement(this.modalContainer, projectPath);


    this.newProjectTypeSelector = new NewProjectTypeSelector();
    insertElement(this.modalContainer, this.newProjectTypeSelector.element());


    // Platform Chooser Block / Install manually
    this.projectPlatformButtons = new UIButtonGroup(UIButtonGroupMode.Toggle)
        .addButton(new UIButtonConfig().setId('ios').setCaption('iOS').setSelected(true))
        .addButton(new UIButtonConfig().setId('android').setCaption('Android').setSelected(true))
        .addButton(new UIButtonConfig().setId('browser').setCaption('Browser').setSelected(true));
    let projectPlatforms = createControlBlock('project-platforms','Project Platforms', this.projectPlatformButtons.element())
    insertElement(this.modalContainer, projectPlatforms);


    //Action buttons
    this.actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
      .addButton(new UIButtonConfig()
            .setId('cancel')
            .setCaption('Cancel')
            .setClickListener(()=>{
                this.close()
            }))
      .addButton(new UIButtonConfig()
            .setId('create')
            .setButtonType('success')
            .setCaption('Create')
            .setClickListener(()=>{
                this.doCreateProject()
            }))
    let modalActionButtons = createModalActionButtons(this.actionButtons.element());
    insertElement(this.modalContainer, modalActionButtons);


    // Create Logger Overlay
    this.newProjectProgressPanel = new NewProjectProgressPanel();
    this.newProjectProgressPanel.hide()
    insertElement(this.modalContainer, this.newProjectProgressPanel.element());


    let modalWindow = createElement('div',{
      className : 'de-workbench-modal-window'
    })

    insertElement(modalWindow,  this.modalContainer)

    this.element = createElement('div',{
      elements: [ modalWindow ],
      className : 'de-workbench-modal'
    })

    let modalConfig = {
      item: this.element,
      visible: false
    }
    modalConfig['className'] = 'de-workbench-modal'
    this.panel = atom.workspace.addModalPanel(modalConfig)



  }

  protected doCreateProject(){
    let newPrjInfo:NewProjectInfo = this.getNewProjectInfo();
    if (this.validateNewProjectInfo(newPrjInfo)){
      this.newProjectProgressPanel.show()
      this.newProjectProgressPanel.startLog()
      ProjectManager.getInstance().cordova.createNewProject(newPrjInfo).then((result)=>{
        console.log("Created! " , result)
        this.newProjectProgressPanel.hide()
        this.newProjectProgressPanel.stopLog()
        this.close()
        UINotifications.showInfo("Project created successfully.")
        atom.open({'pathsToOpen': [newPrjInfo.path], '.newWindow': true});
      },(err)=>{
        console.log("Failure! " , err)
        this.newProjectProgressPanel.hide()
        this.newProjectProgressPanel.stopLog()
        this.close()
        UINotifications.showInfo("Project creation error.")
      });
    }
    console.log("Creation launched!")
  }

  private validateNewProjectInfo(newPrjInfo:NewProjectInfo):boolean {
    if (newPrjInfo.name==null || newPrjInfo.name.length==0){
      alert("Invalid project name");
      return false;
    }
    if (newPrjInfo.packageId==null || newPrjInfo.packageId.length==0){
      alert("Invalid package ID");
      return false;
    }
    if (newPrjInfo.basePath==null || newPrjInfo.basePath.length==0){
      alert("Invalid project folder");
      return false;
    }
    if (newPrjInfo.platforms==null || newPrjInfo.platforms.length==0){
      alert("No platform selected.");
      return false;
    }
    return true;
  }

  private showProjectTemplateSection(show:boolean){
    if (show){
      this.projectTemplateSection.style["display"] = "initial";
    } else {
      this.projectTemplateSection.style["display"] = "none";
    }
  }

  open (activePlugin?: Plugin) {
    this.panel.show()
  }

  close () {
    this.panel.hide()
    this.destroy()
  }

  private createTextElement(placeholder:string, id:string){
    let txtElement = createElement('input',{
      className: 'input-text native-key-bindings'
    })
    txtElement.setAttribute('id', id);
    txtElement.setAttribute('type','text')
    txtElement.setAttribute('placeholder',placeholder)
    txtElement.setAttribute('tab-index',"-1")

    txtElement.addEventListener('keydown', (evt)=>{
      var TABKEY = 9;
      if(evt.keyCode == TABKEY) {
        let nextControl = this.getNextControlFocus(evt.srcElement.id, evt);
      }
    })

    return txtElement
  }

  private getNextControlFocus(currentID, evt){
      console.log("getNextControlFocus ", currentID);
      if (currentID==this.TXT_PROJECT_NAME){
        document.getElementById(this.TXT_PROJECT_PACKAGE_ID).focus()
      } else   if (currentID==this.TXT_PROJECT_PACKAGE_ID){
        document.getElementById(this.TXT_PROJECT_PATH).focus()
      } else   if (currentID==this.TXT_PROJECT_PATH){
        document.getElementById(this.TXT_PROJECT_NAME).focus()
      } else {

      }
      return null;
  }

  private createButton(caption:string):HTMLElement{
      let buttonEl = createElement('button',{
        elements: [
          createText(caption)
        ],
        className : 'btn'
      })
      return buttonEl;
  }

  private createTextControlBlock(id:string, caption:string,placeholder:string){
    let txtField = this.createTextElement(placeholder, id);
    return createControlBlock(id,caption, txtField)
  }

  private createTextControlBlockWithButton(id:string, caption:string,placeholder:string,buttonCaption:string, buttonListener){
    let txtField = this.createTextElementWithButton(placeholder, id, buttonCaption, buttonListener);
    return createControlBlock(id,caption, txtField)
  }

  private createTextElementWithButton(placeholder:string, id:string, buttonCaption:string, buttonListener){
    let inputEl:HTMLElement = this.createTextElement(placeholder, id);
    inputEl.style.display = 'inline-block';
    inputEl.style.width = 'calc(100% - 137px)';
    inputEl.style.marginRight = "4px"

    let buttonEl = this.createButton(buttonCaption);
    buttonEl.classList.add('inline-block')
    buttonEl.classList.add('highlight')
    buttonEl.style.width='133px';
    buttonEl.addEventListener('click', buttonListener);

    let divElement = createElement('div',{
      elements: [
        inputEl,buttonEl
      ],
        className: ''
    })
    return divElement;
  }

  protected chooseFolder(){
    var path = dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (path && path.length>0){
      let txtEl = document.getElementById(this.TXT_PROJECT_PATH);
      txtEl["value"] = path;
    }
  }

  protected getCurrentSelectedFolder():string{
    let txtEl = document.getElementById(this.TXT_PROJECT_PATH);
    return txtEl["value"];
  }

  protected getCurrentSelectedPackagedID():string{
    let txtEl = document.getElementById(this.TXT_PROJECT_PACKAGE_ID);
    return txtEl["value"];
  }

  protected getCurrentSelectedProjectName():string{
    let txtEl = document.getElementById(this.TXT_PROJECT_NAME);
    return txtEl["value"];
  }

  protected getCurrentSelectedPlatforms():Array<string>{
    return this.projectPlatformButtons.getSelectedButtons()
  }

  protected getNewProjectInfo():NewProjectInfo {
      return {
        name : this.getCurrentSelectedProjectName(),
        packageId : this.getCurrentSelectedPackagedID(),
        basePath : this.getCurrentSelectedFolder(),
        path: path.join(this.getCurrentSelectedFolder(), this.getCurrentSelectedProjectName()),
        platforms : this.getCurrentSelectedPlatforms(),
        type: this.newProjectTypeSelector.getProjectType(),
        template: this.newProjectTypeSelector.getTemplateName()
      }
  }

  protected destroy(){
    this.newProjectProgressPanel.destroy();
    this.newProjectProgressPanel = undefined;

    this.projectPlatformButtons.destroy();
    this.projectPlatformButtons = undefined;

    this.actionButtons.destroy();
    this.actionButtons = undefined;

    this.newProjectTypeSelector.destroy();
    this.newProjectTypeSelector = undefined;

    this.modalContainer.remove();
    this.modalContainer = undefined;

    this.element = undefined;
    this.panel = undefined;

    this.events = undefined;
  }


}
