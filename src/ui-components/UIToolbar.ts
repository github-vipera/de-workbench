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

export class UIToolbarButton {
  public id: string;
  public caption: string;
  public title: string;
  public handler: Function;
  public className: string = '';
  public setId(id:string):UIToolbarButton { this.id = id; return this; }
  public setCaption(caption:string):UIToolbarButton { this.caption = caption; return this; }
  public setTitle(title:string):UIToolbarButton { this.title = title; return this; }
  public setClassName(className:string):UIToolbarButton { this.className = className; return this; }
  public setHandler(handler:Function):UIToolbarButton { this.handler = handler; return this; }
}

export class UIToolbar extends UIBaseComponent {

  private floatRightButtons:HTMLElement;

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){
    this.floatRightButtons = createElement('div',{
      elements : [
      ],
      className : 'de-workbench-uitoolbar-container-floatright'
    });

      this.mainElement = createElement('div',{
        elements : [
          this.floatRightButtons
        ],
        className : 'de-workbench-uitoolbar-container'
      });
  }

  public addElement(element:HTMLElement):UIToolbar {
    insertElement(this.mainElement, element);
    return this;
  }

  public addRightElement(element:HTMLElement):UIToolbar {
    insertElement(this.floatRightButtons, element);
    return this;
  }

  public addButton(button:UIToolbarButton):UIToolbar {
    let btn = this.createButton(button);
    this.addElement(btn);
    return this;
  }

  public addRightButton(button:UIToolbarButton):UIToolbar {
    let btn = this.createButton(button);
    this.addRightElement(btn);
    return this;
  }

  protected createButton(button:UIToolbarButton):HTMLElement{
    let className = "btn";
    if (button.className){
      className += " " + button.className;
    }
    let newButton = createElement('button',{
      elements : [
        createText(button.caption)
      ],
      className : className
    });
    return newButton;
  }


}
