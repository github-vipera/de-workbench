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
import { DEWBResourceManager } from "../../DEWorkbench/DEWBResourceManager"
import { NewProjectTypeSelector } from './NewProjectTypeSelector'

const remote = require('remote');
const dialog = remote.require('electron').dialog;

export interface NewProjectInfo {
  projectName:string;
  packagedID:string;
  path:string;
  platforms:Array<string>
}

export class NewProjectView {

  private element: HTMLElement
  private events: EventEmitter
  private panel: any
  //private txtProjectName: HTMLElement;
  //private txtPackageID:HTMLElement;
  //private txtDestinationPath:HTMLElement;
  //private editorElement: HTMLElement;

  private projectPlatformButtons: UIButtonGroup;
  private actionButtons:UIButtonGroup;
  private projectTemplateSection:HTMLElement;
  private newProjectTypeSelector:NewProjectTypeSelector;

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
    let projectName = this.createTextControlBlock('deweb-new-project-name','Project Name', 'Your project name');
    insertElement(this.modalContainer, projectName);


    // Project package id
    let packageID = this.createTextControlBlock('deweb-new-package-id','Package ID', 'Your project package ID (ex: com.yourcompany.yourapp)');
    insertElement(this.modalContainer, packageID);


    // Project path
    let buttonListener = ()=>{ this.chooseFolder() }
    let projectPath = this.createTextControlBlockWithButton('deweb-new-project-path', 'Destination Path', 'Your project path', 'Choose Folder...', buttonListener)
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
    alert(JSON.stringify(newPrjInfo))
    //TODO!!
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
    /**
    let txtElement = createElement('atom-text-editor',{
      className: 'editor mini'
    })
    txtElement.setAttribute('mini','')
    txtElement.setAttribute('data-grammar','text plain null-grammar')
    txtElement.setAttribute('tab-index',tabIndex)
    **/
    let txtElement = createElement('input',{
      className: 'input-text native-key-bindings'
    })
    txtElement.setAttribute('id', id);
    txtElement.setAttribute('type','text')
    txtElement.setAttribute('placeholder',placeholder)
    return txtElement
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
      let txtEl = document.getElementById('deweb-new-project-path');
      txtEl["value"] = path;
    }
  }

  protected getCurrentSelectedFolder():string{
    let txtEl = document.getElementById('deweb-new-project-path');
    return txtEl["value"];
  }

  protected getCurrentSelectedPackagedID():string{
    let txtEl = document.getElementById('deweb-new-package-id');
    return txtEl["value"];
  }

  protected getCurrentSelectedProjectName():string{
    let txtEl = document.getElementById('deweb-new-project-name');
    return txtEl["value"];
  }

  protected getCurrentSelectedPlatforms():Array<string>{
    return this.projectPlatformButtons.getSelectedButtons()
  }

  protected getNewProjectInfo():NewProjectInfo {
      return {
        projectName : this.getCurrentSelectedProjectName(),
        packagedID : this.getCurrentSelectedPackagedID(),
        path : this.getCurrentSelectedFolder(),
        platforms : this.getCurrentSelectedPlatforms()
      }
  }

  protected destroy(){
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
