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
const ResizeObserver = require('resize-observer-polyfill');
const Terminal = require('xterm');
Terminal.loadAddon('fit');

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
  private terminal:any;

  constructor () {
    this.atomWorkspace = atom.workspace;

    this.events = new EventEmitter()
    this.element = document.createElement('de-workbench-terminal-view')
    /**
    this.element.addEventListener('copy',()=>{
      console.log("On copy " , this.terminal)
    })
    **/

    let resizeObserver = new ResizeObserver(() => this.outputResized());
		resizeObserver.observe(this.element);

    atom.commands.add('de-workbench-terminal-view', {
          'de-workbench-terminal:copy': () => this.copyToClipboard()
    });

  this.terminal = new Terminal({
   			rows: 10,
   			cols: 80,
        scrollback:10,
   			useStyle: false,
   			cursorBlink: false
   		});
    this.terminal.open(this.element)
    this.terminal.fit();

    this.terminal.write('Hello from \033[1;3;31mxterm.js\033[0m $ \r\n')

    this.terminal.write('\x1b[31mWelcome to term.js!\x1b[m\r\n');
    for (var i=0;i<20;i++){
      this.terminal.write('Hello World! ' + i + '\r\n');
    }

    var style = '';
    		const editor = atom.config["settings"].editor;

    		if (editor) {
    			if (editor.fontSize)
    				style += 'font-size:' + editor.fontSize + 'px;';
    			if (editor.fontFamily)
    				style += 'font-family:' + editor.fontFamily + ';';
    			if (editor.lineHeight)
    				style += 'line-height:' + editor.lineHeight + ';';

    			this.element.setAttribute('style', style);
    		}

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

  run(){
      alert("RUN!")
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

  protected outputResized(){
    return this.terminal.fit();
  }

  copyToClipboard() {
  		return atom.clipboard.write(this.terminal.getSelection());
}

}
