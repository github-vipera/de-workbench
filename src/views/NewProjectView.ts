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
 } from '../element/index';

import { EventEmitter }  from 'events'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../ui-components/UIButtonGroup'
import { UITextEditorExtended } from '../ui-components/UITextEditorExtended'

export class NewProjectView {

  private element: HTMLElement
  private events: EventEmitter
  private panel: any
  private txtProjectName: HTMLElement;
  private txtPackageID:HTMLElement;
  private txtDestinationPath:HTMLElement;
  private editorElement: HTMLElement;

  private projectTypeButtons:UIButtonGroup;
  private projectPlatformButtons: UIButtonGroup;
  private actionButtons:UIButtonGroup;
  private projectTemplateSection:HTMLElement;
  private extTextField:UITextEditorExtended;

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
    let projectName = this.createTextControlBlock('project-name','Project Name', 'Your project name');
    insertElement(this.modalContainer, projectName);


    // Project package id
    let packageID = this.createTextControlBlock('package-id','Package ID', 'Your project package ID (ex: com.yourcompany.yourapp)');
    insertElement(this.modalContainer, packageID);


    // Project path
    let projectPath = this.createTextControlBlockWithButton('project-path', 'Destination Path', 'Your project path', 'Choose Folder...')
    insertElement(this.modalContainer, projectPath);




    // Project Type Radio
    this.projectTypeButtons = new UIButtonGroup(UIButtonGroupMode.Radio)
                            .addButton(new UIButtonConfig().setId('a').setCaption('Standard Apache Cordova').setSelected(true).setClickListener(()=>{
                              this.selectProjectType('CORDOVA_PLAIN')
                            }))
                            .addButton(new UIButtonConfig().setId('b').setCaption('Ionic Framework').setClickListener(()=>{
                              this.selectProjectType('IONIC')
                            }))
                            .addButton(new UIButtonConfig().setId('c').setCaption('Ionic Framework 3').setClickListener(()=>{
                              this.selectProjectType('IONIC_3')
                            }));
    let projectType = this.createControlBlock('project-type','Project Type', this.projectTypeButtons.element())
    insertElement(this.modalContainer, projectType);



    // Project template selection
    this.projectTemplateSection = this.createProjectTemplateSelection();
    insertElement(this.modalContainer, this.projectTemplateSection);
    this.showProjectTemplateSection(false)



    // Platform Chooser Block / Install manually
    this.projectPlatformButtons = new UIButtonGroup(UIButtonGroupMode.Toggle)
        .addButton(new UIButtonConfig().setId('ios').setCaption('iOS').setSelected(true))
        .addButton(new UIButtonConfig().setId('android').setCaption('Android').setSelected(true))
        .addButton(new UIButtonConfig().setId('browser').setCaption('Browser').setSelected(true));
    let projectPlatforms = this.createControlBlock('project-platforms','Project Platforms', this.projectPlatformButtons.element())
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
                this.close()
            }))
    let actionButtonsEl = this.createControlBlock('action-buttons', null, this.actionButtons.element())
    actionButtonsEl.style.float = "right"
    insertElement(this.modalContainer, actionButtonsEl);



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

  private selectProjectType(type:string){
    if (type==='CORDOVA_PLAIN'){
      this.showProjectTemplateSection(false)
    } else if (type==='IONIC') {
      this.showProjectTemplateSection(true)
    } else if (type==='IONIC_3') {
      this.showProjectTemplateSection(true)
    }
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
    this.element = undefined;
    this.panel = undefined;
    this.destroy()
  }

  protected destroy(){
    this.extTextField.destroy();
  }

  private createTextElement(placeholder:string, id:string){
    let txtElement = createElement('input',{
      className: 'input-text native-key-bindings'
    })
    txtElement.setAttribute('id', id);
    txtElement.setAttribute('type','text')
    txtElement.setAttribute('placeholder',placeholder)
    return txtElement
  }

  private createLabel(caption:string){
      let labelElement = createElement('label',{
        elements: [createText(caption)]
      })
      return labelElement;
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
    return this.createControlBlock(id,caption, txtField)
  }

  private createTextControlBlockWithButton(id:string, caption:string,placeholder:string,buttonCaption:string){
    let txtField = this.createTextElementWithButton(placeholder, id, buttonCaption);
    return this.createControlBlock(id,caption, txtField)
  }

  private createTextElementWithButton(placeholder:string, id:string, buttonCaption:string){
    let inputEl:HTMLElement = this.createTextElement(placeholder, id);
    inputEl.style.display = 'inline-block';
    inputEl.style.width = 'calc(100% - 137px)';
    inputEl.style.marginRight = "4px"

    let buttonEl = this.createButton(buttonCaption);
    buttonEl.classList.add('inline-block')
    buttonEl.classList.add('highlight')
    buttonEl.style.width='133px';

    let divElement = createElement('div',{
      elements: [
        inputEl,buttonEl
      ],
        className: ''
    })
    return divElement;
  }

  private createControlBlock(id:string, caption:string, element:HTMLElement){
    var label;
    if (caption && caption.length>0){
      label = this.createLabel(caption);
    }
    let blockElement = this.createBlock()
    let innerDiv = createElement('div',{
      elements: [ element ],
      className : 'de-workbench-newproj-innerdiv'
    });
    if (label){
      insertElement(blockElement, label);
    }
    insertElement(blockElement, innerDiv);
    return blockElement;
  }

  private createBlock(){
    let blockElement = createElement('div',{
      elements: [
      ],
        className: 'block'
    })
    return blockElement;
  }

  private createProjectTemplateSelection():HTMLElement {
      let labelInfo = this.createLabel("In order to create a Ionic project you need to have installed on your computer the Ionic cli utility.To check if it's already installed launch 'ionic help' command into the terminal.");
      labelInfo.classList.add('text-warning')

      let label = this.createLabel('Project Template');

      let templateCombo = createElement('select',{
        className : 'form-control'
      });

      let templateBlock = this.createControlBlock('project-template',null,templateCombo);
      templateBlock.classList.add('settings-view')

      let templateSection = createElement('div',{
        elements:[labelInfo, label, templateBlock]
      })

      templateSection.style["padding-bottom"] = "10px";

      return templateSection;
  }

}
