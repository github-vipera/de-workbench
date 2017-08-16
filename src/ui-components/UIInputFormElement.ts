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

export class UIInputFormElement extends UIBaseComponent {

  protected events:EventEmitter;
  private label:HTMLElement;
  private inputEditor:HTMLElement;
  private listeners:Array<Function>;
  private lastValue:string='';
  private password:boolean=false;

  constructor(password?:boolean){
    super();
    this.password = password;
    this.events = new EventEmitter();
    this.buildUI();
  }

  protected buildUI(){
    this.label = createElement('label', {
      elements: [
      ]
    })
    this.inputEditor = this.createInputEditor();

    this.mainElement = this.createControlContainer(this.label, this.inputEditor)

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
    if (this.password){
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

}

export class UIInputWithButtonFormElement extends UIInputFormElement {

  constructor(password?:boolean){
    super(password);
  }

  protected createControlContainer(label:HTMLElement, inputEditor:HTMLElement):HTMLElement {
    inputEditor.style.display = 'inline-block';
    inputEditor.style.marginRight = "4px"

    let buttonEl = this.createButton("Browse...");
    buttonEl.classList.add('inline-block')
    buttonEl.classList.add('highlight')
    buttonEl.addEventListener('click', (evt)=>{
      this.fireEvent('didActionClicked')
    });
    let divElement = createElement('div',{
      elements: [
        inputEditor,buttonEl
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

}
