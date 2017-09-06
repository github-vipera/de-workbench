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
import { UIInputFormElement } from './UIInputFormElement'
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
    let inputEl = createElement('input',{
      className : 'input-text'
    })
    inputEl.setAttribute('placeholder', placeholder)
    inputEl.value = value
    inputEl.setSelectionRange(0, value.length)
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
    let spacer = createElement('div',{});
    spacer.style.height = "10px"
    this.container = createElement('div',{
      elements: [this.inputEl, spacer, createText('Press Esc to cancel')],
    })
    this.container.style["padding-left"] = "10px"
    this.container.style["padding-right"] = "10px"

    let modalConfig = {
      item: this.container
    }
    modalConfig['className'] = 'de-workbench-modal'


    this.panel = atom.workspace.addModalPanel(modalConfig);
    this.inputEl.focus();
  }

  protected doConfirm(){
    let txtValue = this.inputEl["value"];//["getModel"]().getText();
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
