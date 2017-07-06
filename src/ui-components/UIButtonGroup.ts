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

  public addButton(id:string, caption:string, selected:boolean, clickListener?:Function):UIButtonGroup {
    let button = this.createButton(id, caption,selected, clickListener);
    insertElement(this.buttonGroup, button);
    this.buttons[id] = { element: button, id: id, caption: caption };
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
   * Create a button for platform selection
   */
  private createButton(id:string, caption:string, selected:boolean, clickListener?:Function):HTMLElement {
    let className = "btn platform-select";
    let btn:HTMLElement = createElement('button',{
      elements: [
        createText(caption)
      ],
      className: className
    })

    btn.setAttribute('toggle-id',id)

    if (selected){
      this.selectButton(id);
    }

    btn.addEventListener('click',(evt)=>{

      if (this.toggleMode==UIButtonGroupMode.Standard){
        //nop
      } else if (this.toggleMode==UIButtonGroupMode.Toggle) {
        let el:any = evt.currentTarget;
        el.classList.toggle('selected');
      } else if (this.toggleMode==UIButtonGroupMode.Radio) {

      }

      if (clickListener){
        clickListener(id);
      }

    });

    return btn;
  }




}
