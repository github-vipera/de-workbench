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
const { CompositeDisposable } = require('atom');

export class UIModalPrompt {

  container:HTMLElement;
  events:EventEmitter;
  inputEl:HTMLElement;
  placeholder:string;
  value:string;
  panel:any;
  onConfirmCallback:Function;
  onCancelCallback:Function;
  subscriptions:any;

  constructor(){
    this.events = new EventEmitter();
  }

  protected createEditor(value, placeholder){
    let inputEl = createTextEditor({
      value: value,
      placeholder: placeholder,
      change: (value) => {
        this.events.emit('didChanged')
      }
    })
    return inputEl;
  }

  public addEventListener(event:string, listener){
    this.events.addListener(event, listener);
  }

  public removeEventListener(event:string, listener){
    this.events.removeListener(event, listener);
  }

  public destroy(){
    this.events.removeAllListeners();
    this.panel = null;
  }

  public show(value:string, placeholder:string, onConfirmCallback:Function, onCancelCallback:Function){
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'core:cancel': () => this.doCancel()
    }));

    this.onConfirmCallback = onConfirmCallback;
    this.onCancelCallback = onCancelCallback;
    this.placeholder = placeholder;
    this.value = value;
    this.inputEl = this.createEditor(value, placeholder);
    this.inputEl.addEventListener('keydown',(evt)=>{
      evt.stopPropagation()
      if (evt.keyCode===13){
        this.doConfirm()
      } else if  (evt.keyCode===27){
        this.doCancel()
      }
    })
    this.container = createElement('div',{
      elements: [this.inputEl, createText('Press Esc to cancel')]
    })
    this.panel = atom.workspace.addModalPanel({
      item: this.container
    });
    this.inputEl.focus();
  }

  protected doConfirm(){
    let txtValue = this.inputEl["getModel"]().getText();
    this.closePanel();
    this.onConfirmCallback(txtValue);
  }

  protected doCancel(){
    this.closePanel();
    this.onCancelCallback();
  }

  protected closePanel(){
    this.panel.hide();
    this.panel.destroy();
    this.panel = null;
    this.container.remove();
    this.container = null;
    this.subscriptions.dispose();
  }


}
