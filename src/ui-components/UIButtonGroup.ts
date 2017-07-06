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

  constructor(toggleMode:UIButtonGroupMode){
    super();
    this.toggleMode = toggleMode;
    this.buildUI();
  }

  private buildUI(){
    this.buttons = {};

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
  public selectButton(id:string){
    if (this.toggleMode==UIButtonGroupMode.Standard){
      //nop
    } else if (this.toggleMode==UIButtonGroupMode.Toggle){
      this.buttons[id].element.classList.toggle('selected');
    } else if (this.toggleMode==UIButtonGroupMode.Radio){
      //TODO!!
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

    btn.setAttribute('toggle-id',buttonConfig.id)

    if (buttonConfig.selected){
      btn.classList.add('selected');
    }

    btn.addEventListener('click',(evt)=>{

      if (this.toggleMode==UIButtonGroupMode.Standard){
        //nop
      } else if (this.toggleMode==UIButtonGroupMode.Toggle) {
        let el:any = evt.currentTarget;
        el.classList.toggle('selected');
      } else if (this.toggleMode==UIButtonGroupMode.Radio) {

      }

      if (buttonConfig.clickListener){
        buttonConfig.clickListener(buttonConfig.id);
      }

    });

    return btn;
  }

  public getSelectedButtons():Array<String>{
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


}
