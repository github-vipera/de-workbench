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
import { UIComponent, UIBaseComponent } from '../ui-components/UIComponent'
import { UISelect, UISelectItem, UISelectListener } from '../ui-components/UISelect'

const $ = require('jquery')
const remote = require('remote');
const dialog = remote.require('electron').dialog;
const path = require("path");

export interface UIInputFormElementOptions {
  password?:boolean;
  autoSelect?:boolean;
}

export class UIInputFormElement extends UIBaseComponent {

  protected events:EventEmitter;
  private label:HTMLElement;
  private inputEditor:HTMLElement;
  private listeners:Array<Function>;
  private lastValue:string='';
  private options:UIInputFormElementOptions;
  private chainToEl:HTMLElement;

  constructor(options?:UIInputFormElementOptions){
    super();
    if (options){
      this.options = options;
    } else {
      this.options = this.defaultOptions();
    }
    this.events = new EventEmitter();
    this.buildUI();
  }

  protected defaultOptions():UIInputFormElementOptions{
      return {
        password:false,
        autoSelect:true
      }
  }

  protected buildUI(){
    this.label = createElement('label', {
      elements: [
      ]
    })
    this.inputEditor = this.createInputEditor();
    this.inputEditor.addEventListener('keydown', (evt)=>{
      var TABKEY = 9;
      if (this.chainToEl && evt.keyCode == TABKEY){
        this.chainToEl.focus();
      }
    })


    this.mainElement = this.createControlContainer(this.label, this.inputEditor)

    if (this.options && !this.options.autoSelect){
    } else {
      $(this.inputEditor).focus(()=> {
        this.selectAll()
      } );
    }

  }

  protected createControlContainer(label:HTMLElement, inputEditor:HTMLElement):HTMLElement {
    return createElement('div',{
      elements: [
        label,
        inputEditor
      ],
      className: 'block control-group'
    })
  }

  protected createInputEditor():HTMLElement {
    let inputEditor = createElement('input', {
      className: 'input-text native-key-bindings mini'
    })
    if (this.options && this.options.password){
      inputEditor.setAttribute('type','password');
    }
    inputEditor.setAttribute('mini','');
    inputEditor.setAttribute('tabindex','-1');
    inputEditor.addEventListener('keydown',(evt)=>{
      this.fireEvent('keydown')
    })
    inputEditor.addEventListener('keyup',(evt)=>{
      if (this.lastValue!=this.getValue()){
        this.fireEvent('change')
        this.lastValue = this.getValue();
      }
    })
    return inputEditor;
  }

  public chainTo(nextElement:HTMLElement):UIInputFormElement {
    this.chainToEl = nextElement;
    return this;
  }

  public toChain():HTMLElement {
    return this.inputEditor;
  }

  public setCaption(caption:string):UIInputFormElement{
      this.label.innerText = caption;
      return this;
  }

  public setValue(value:string):UIInputFormElement{
    this.inputEditor["value"] = value;
    return this;
  }

  public getValue():string{
    return this.inputEditor["value"];
  }

  public setWidth(width:string):UIInputFormElement{
    this.mainElement.style.width = width
    return this;
  }

  public setPlaceholder(placeholder:string):UIInputFormElement{
    this.inputEditor.setAttribute('placeholder',placeholder)
    return this;
  }

  public addEventListener(event:string, listener):UIInputFormElement{
    this.events.addListener(event, listener)
    return this;
  }

  protected fireEvent(event:string){
    this.events.emit(event, this)
  }

  protected selectAll(){
    if (this.inputEditor["setSelectionRange"]){
      this.inputEditor["setSelectionRange"](0, this.getValue().length);
    }
  }

  public destroy(){
    this.events.removeAllListeners();
    this.events = null;
    this.label.remove();
    this.inputEditor.remove();
    this.label = null;
    this.inputEditor = null;
    super.destroy();
  }

}

export class UISelectFormElement extends UIInputFormElement {

  selectCtrl:UISelect;

  constructor(){
    super();
  }

  protected createInputEditor():HTMLElement {
    this.selectCtrl = new UISelect();
    this.selectCtrl.element().style.width = "100%"
    return this.selectCtrl.element();
  }

  public setCaption(caption:string):UISelectFormElement{
    super.setCaption(caption);
    return this;
  }

  public getSelectCtrl():UISelect {
    return this.selectCtrl;
  }

  public setItems(items:Array<UISelectItem>){
    this.selectCtrl.setItems(items);
  }

  public setValue(value:string):UIInputFormElement{
    this.selectCtrl.setSelectedItem(value)
      return this;
  }

  public getValue():string{
    return this.selectCtrl.getSelectedItem()
  }

  public chainTo(nextElement:HTMLElement):UIInputFormElement {
    super.chainTo(nextElement)
    return this;
  }


}

export class UIInputWithButtonFormElement extends UIInputFormElement {

  protected buttonEl:HTMLElement;

  constructor(options?:UIInputFormElementOptions){
    super(options);
  }

  protected createControlContainer(label:HTMLElement, inputEditor:HTMLElement):HTMLElement {
    inputEditor.style.display = 'inline-block';
    inputEditor.style.marginRight = "4px"

    this.buttonEl = this.createButton("Browse...");
    this.buttonEl.classList.add('inline-block')
    this.buttonEl.classList.add('highlight')
    this.buttonEl.addEventListener('click', (evt)=>{
      this.fireEvent('didActionClicked')
    });
    let divElement = createElement('div',{
      elements: [
        inputEditor,this.buttonEl
      ],
        className: ''
    })
    divElement.style.display = "flex"

    return createElement('div',{
      elements: [
        label,
        divElement
      ],
      className: 'block control-group'
    })
  }

  private createButton(caption:string):HTMLElement{
      let buttonEl = createElement('button',{
        elements: [
          createText(caption)
        ],
        className : 'btn btn-sm'
      })
      return buttonEl;
  }

  public setButtonCaption(caption:string):UIInputWithButtonFormElement {
    this.buttonEl.innerText = caption;
    return this;
  }

  public setCaption(caption:string):UIInputWithButtonFormElement{
    super.setCaption(caption);
      return this;
  }

  public setPlaceholder(placeholder:string):UIInputWithButtonFormElement{
    super.setPlaceholder(placeholder)
    return this;
  }

  public addEventListener(event:string, listener):UIInputWithButtonFormElement{
    super.addEventListener(event, listener)
    return this;
  }

  public chainTo(nextElement:HTMLElement):UIInputWithButtonFormElement {
    super.chainTo(nextElement)
    return this;
  }


}

export class UIInputBrowseForFolderFormElement extends UIInputWithButtonFormElement {

  constructor(options?:UIInputFormElementOptions){
    super(options);
    this.prepareForEvents();
  }

  protected prepareForEvents(){
    this.addEventListener('didActionClicked',(evt)=>{
      this.chooseFolder();
    })
  }

  protected chooseFolder(){
    var path = dialog.showOpenDialog({
      properties: ['openDirectory']
    });
    if (path && path.length>0){
      this.setValue(path);
    }
  }

  public setCaption(caption:string):UIInputBrowseForFolderFormElement{
    super.setCaption(caption);
    return this;
  }

  public setPlaceholder(placeholder:string):UIInputBrowseForFolderFormElement{
    super.setPlaceholder(placeholder)
    return this;
  }

  public addEventListener(event:string, listener):UIInputBrowseForFolderFormElement{
    super.addEventListener(event, listener)
    return this;
  }

  public chainTo(nextElement:HTMLElement):UIInputBrowseForFolderFormElement {
    super.chainTo(nextElement)
    return this;
  }

}
