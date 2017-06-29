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


export class DebugAreaView {

  private element: HTMLElement
  private events: EventEmitter
  private panel: any
  private txtProjectName: HTMLElement;
  private txtPackageID:HTMLElement;
  private txtDestinationPath:HTMLElement;
  private editorElement: HTMLElement;
  private item: any;
  private atomWorkspace:any;

  constructor () {
    this.atomWorkspace = atom.workspace;

    this.events = new EventEmitter()
    this.element = document.createElement('de-workbench-debugarea-view')

    let title =  createElement('scheme-label', {
        elements: [createText('Debug Area')]
    })
    insertElement(this.element, title)


  }

  open () {
    if (this.item){
      this.atomWorkspace.toggle(this.item);
    } else {
      const  prefix = "dewb";
      const uri = prefix + '//' + '_debugarea';
      this.item = {
        activatePane: true,
        searchAllPanes: true,
        location: 'right',
        element: this.element,
        getTitle: () => 'DE Debug Area',
        getURI: () => uri,
        getDefaultLocation: () => 'right',
        getAllowedLocations: () => ['left', 'right']
      };
      this.atomWorkspace.open(this.item).then((view)=>{
      });
    }
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
