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
import { UIToggleButtons, UIToggleButtonsMode } from '../ui-components/UIToggleButtons'

export class NewProjectView {

  private element: HTMLElement
  private events: EventEmitter
  private panel: any
  private txtProjectName: HTMLElement;
  private txtPackageID:HTMLElement;
  private txtDestinationPath:HTMLElement;
  private editorElement: HTMLElement;

  private projectTypeButtons:UIToggleButtons;

  constructor () {
    this.events = new EventEmitter()
    this.element = document.createElement('xatom-debug-scheme') //de-workbench-newproject-view
    this.editorElement = createElement('xatom-debug-scheme-editor', {
      /*className: 'native-key-bindings'*/
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

    this.projectTypeButtons = new UIToggleButtons(UIToggleButtonsMode.Radio);
    this.projectTypeButtons.addButton('a','Standard Apache Cordova', false, null)
                           .addButton('b', 'Ionic Framework', false, null)
                           .addButton('c', 'Ionic 3 Framework', false, null);
    insertElement(this.editorElement, this.projectTypeButtons.element());
    this.projectTypeButtons.toggleButton('b');


    insertElement(this.element, [
      this.editorElement,
      createElement('xatom-debug-scheme-buttons', {
        elements: [
          createButton({
            click: () => this.close()
          }, [createText('Create')]),
          createButton({
            click: () => this.close()
          }, [createText('Cancel')])
        ]
      })]
    )

    let modalConfig = {
      item: this.element,
      visible: false
    }
    modalConfig['className'] = 'xatom-debug-modal'
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
