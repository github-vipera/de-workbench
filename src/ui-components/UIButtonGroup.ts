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

import { UIComponent, UIBaseComponent } from './UIComponent'

export enum UIButtonGroupMode {
    Standard,
    Toggle,
    Radio
}

export class UIButtonConfig {
  public id: string;
  public caption: string;
  public selected: boolean = false;
  public buttonType: string = '';
  public clickListener: Function;
  public className: string = '';
  public setId(id:string):UIButtonConfig{
    this.id = id;
    return this;
  }
  public setCaption(caption:string):UIButtonConfig{
    this.caption = caption;
    return this;
  }
  public setSelected(selected:boolean):UIButtonConfig{
    this.selected = selected;
    return this;
  }
  public setButtonType(buttonType:string):UIButtonConfig{
    this.buttonType = buttonType;
    return this;
  }
  public setClassName(className:string):UIButtonConfig{
    this.className = className;
    return this;
  }
  public setClickListener(clickListener:Function):UIButtonConfig{
    this.clickListener = clickListener;
    return this;
  }
}

export class UIButtonGroup extends UIBaseComponent {

  private buttonGroup:HTMLElement;
  private toggleMode:UIButtonGroupMode;
  private buttons:any;
  private listeners:any;

  constructor(toggleMode:UIButtonGroupMode){
    super();
    this.toggleMode = toggleMode;
    this.buildUI();
  }

  private buildUI(){
    this.buttons = {};
    this.listeners = {};

    this.buttonGroup = createElement('div',{
      elements: [
      ],
      className : 'de-workbench-ui-togglebuttons btn-group'
    })
    this.mainElement = this.buttonGroup;
  }

  public addButton(buttonConfig:UIButtonConfig):UIButtonGroup {
    let button = this.createButton(buttonConfig);
    insertElement(this.buttonGroup, button);
    this.buttons[buttonConfig.id] = { element: button, id: buttonConfig.id, caption: buttonConfig.caption };
    return this;
  }

  /**
   * Only for UIButtonGroupMode.Toggle
   */
  public toggleButton(id:string){
    if (this.toggleMode==UIButtonGroupMode.Toggle) {
      this.buttons[id].element.classList.toggle('selected');
    }
  }

  /**
   * Only for UIButtonGroupMode.Toggle and UIButtonGroupMode.Radio
   */
  public selectButton(id:string, select:boolean){
    if (this.toggleMode==UIButtonGroupMode.Standard){
      //nop
    } else if (this.toggleMode==UIButtonGroupMode.Toggle){
      if (select){
        this.buttons[id].element.classList.add('selected');
      } else {
        this.buttons[id].element.classList.remove('selected');
      }
    } else if (this.toggleMode==UIButtonGroupMode.Radio){
      let currentSelection:Array<string> = this.getSelectedButtons();
      for (var i=0;i<currentSelection.length;i++){
        this.buttons[currentSelection[i]].element.classList.remove('selected');
      }
      this.buttons[id].element.classList.add('selected');
    }
  }

  /**
   * Create a button component
   */
  private createButton(buttonConfig:UIButtonConfig):HTMLElement {
    let className = "btn platform-select";
    if (buttonConfig.buttonType){
      className += " btn-" + buttonConfig.buttonType;
    }
    if (buttonConfig.className){
      className += " " + buttonConfig.className;
    }
    let btn:HTMLElement = createElement('button',{
      elements: [
        createText(buttonConfig.caption)
      ],
      className: className
    })

    btn.setAttribute('btngroup-id',buttonConfig.id)

    if (buttonConfig.selected){
      btn.classList.add('selected');
    }

    let buttonClickListener = (evt)=>{
      if (this.toggleMode==UIButtonGroupMode.Standard){
        //nop
      } else if (this.toggleMode==UIButtonGroupMode.Toggle) {
        let el:any = evt.currentTarget;
        el.classList.toggle('selected');
      } else if (this.toggleMode==UIButtonGroupMode.Radio) {
        let buttonEl:any = evt.currentTarget;
        let buttonId = buttonEl.attributes['btngroup-id'].value;
        this.selectButton(buttonId, true);
      }

      if (buttonConfig.clickListener){
        buttonConfig.clickListener(buttonConfig.id);
      }
    }

    btn.addEventListener('click', buttonClickListener);

    this.listeners[buttonConfig.id] = {
      button: btn,
      listener: buttonClickListener,
    }

    return btn;
  }

  public getSelectedButtons():Array<string>{
    let ret = new Array();
    for (var key in this.buttons) {
      if (this.buttons.hasOwnProperty(key)) {
        let button = this.buttons[key];
        if (button.element.classList.contains("selected")){
          ret.push(button.id);
        }
      }
    }
    return ret;
  }

  public destroy(){
    for (var key in this.listeners) {
      if (this.listeners.hasOwnProperty(key)) {
        var btnInfo = this.listeners[key];
        btnInfo.button.removeEventListener('click', btnInfo.listener);
        btnInfo.button.remove();
      }
    }
    this.listeners = {}
    this.buttons = {}
    super.destroy();
  }

}
