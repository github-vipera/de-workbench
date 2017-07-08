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
  private actionButtons:UIButtonGroup;

  private extTextField:UITextEditorExtended;

  constructor () {
    this.events = new EventEmitter()

    /**
    this.element = document.createElement('de-workbench-scheme') //de-workbench-newproject-view

    this.editorElement = createElement('xatom-debug-scheme-editor', {
    })

    let title =  createElement('scheme-label', {
        elements: [createText('New Project')]
    })
    insertElement(this.editorElement, title)

    // Project Name Element
    let configElement = createElement('xatom-debug-scheme-config', {
      elements: [
        createElement('scheme-label', {
          elements: [createText('New Project Name')]
        })
      ]
    })
    this.txtProjectName = this.createControlText("Project Name", 'newPrjName', {default:'New Project'});
    insertElement(configElement, this.txtProjectName)

    // Package ID Element
    let configElement2 = createElement('xatom-debug-scheme-config', {
      elements: [
        createElement('scheme-label', {
          elements: [createText('Package ID')]
        })
      ]
    })
    this.txtPackageID = this.createControlText("Package ID", 'packageID', {default:'com.yourcomapny.yourapp'});
    insertElement(configElement2, this.txtPackageID)


    // Destination Path Element
    this.txtDestinationPath = this.createControlText("Destination Path", 'destinationPath', {default:'Your project path', withButton:true, buttonCaption: 'Choose folder...'});
    let configElement3 = createElement('xatom-debug-scheme-config', {
      elements: [
        createElement('scheme-label', {
          elements: [createText('Destination Path')]
        })
      ]
    })
    insertElement(configElement3, this.txtDestinationPath)


    // Add all
    insertElement(this.editorElement, configElement)
    insertElement(this.editorElement, configElement2)
    insertElement(this.editorElement, configElement3)

    // Project Type Radio
    this.projectTypeButtons = new UIButtonGroup(UIButtonGroupMode.Radio)
                            .addButton(new UIButtonConfig().setId('a').setCaption('Standard Apache Cordova'))
                            .addButton(new UIButtonConfig().setId('b').setCaption('Ionic Framework'))
                            .addButton(new UIButtonConfig().setId('c').setCaption('Ionic Framework 3'));
    insertElement(this.editorElement, this.projectTypeButtons.element());

    this.actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
      .addButton(new UIButtonConfig()
            .setId('cancel')
            .setCaption('Cancel')
            .setClickListener(()=>{
                this.close()
            }))
      .addButton(new UIButtonConfig()
            .setId('create')
            .setButtonType('primary')
            .setCaption('Create')
            .setClickListener(()=>{
                this.close()
            }))

    insertElement(this.element, [
      this.editorElement,
      createElement('xatom-debug-scheme-buttons', {
        elements: [
          this.actionButtons.element()
        ]
      })]
    )
    **/

    this.extTextField = new UITextEditorExtended()
                    .setButtonCaption('Browse')
                    .setTextPlaceholder('Here the path')
                    .addButtonHandler((evt)=>{
                      alert(this.extTextField.getValue())
                      this.close();
                    });

    this.element = this.extTextField.element();

    let modalConfig = {
      item: this.element,
      visible: false
    }
    modalConfig['className'] = 'de-workbench-modal'
    this.panel = atom.workspace.addModalPanel(modalConfig)


  }

  open (activePlugin?: Plugin) {
    this.panel.show()
  }

  close () {
    this.panel.hide()
  }


  createControlText (pluginName: string, key: string, config: any) {
    let value = ''
    if (value === config.default) {
      value = null
    }
    let inputElement = createTextEditor({
      value,
      placeholder: config.default,
      change: (value) => {
        console.log("Value changed: ", value)
        this.events.emit('didChange')
      }
    })
    let elements = [inputElement];
    if (config && config.withButton){
      let button = createButton({
        click: () => {
          this.events.emit('didRun');
        }
      },[
        createText(config.buttonCaption)
      ])
      elements = [inputElement,button];
    }
    return createElement('scheme-control', {
      elements: elements
    })
  }

}
