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
   createTextEditor,
   createButtonSpacer
 } from '../element/index';

import { UIComponent, UIBaseComponent } from './UIComponent'
const { CompositeDisposable } = require('atom');

export class UIToolbarButton {
  public id: string;
  public caption: string;
  public title: string;
  public handler: Function;
  public className: string = '';
  public icon:string;
  public isToggle:boolean = false;
  public checked:boolean = false;
  public setId(id:string):UIToolbarButton { this.id = id; return this; }
  public setCaption(caption:string):UIToolbarButton { this.caption = caption; return this; }
  public setTitle(title:string):UIToolbarButton { this.title = title; return this; }
  public setClassName(className:string):UIToolbarButton { this.className = className; return this; }
  public setHandler(handler:Function):UIToolbarButton { this.handler = handler; return this; }
  public setIcon(icon:string):UIToolbarButton { this.icon = icon; return this; }
  public setToggle(toggle:boolean):UIToolbarButton { this.isToggle = toggle; return this; }
  public setChecked(checked:boolean):UIToolbarButton { this.checked = checked; return this; }
}

export class UIToolbar extends UIBaseComponent {

  private floatRightButtons:HTMLElement;
  private subscriptions:any = new CompositeDisposable();

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
    let spacer = createButtonSpacer();
    insertElement(this.mainElement, spacer);
    insertElement(this.mainElement, element);
    return this;
  }

  public addRightElement(element:HTMLElement):UIToolbar {
    let spacer = createButtonSpacer();
    insertElement(this.mainElement, spacer);
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
    if (button.isToggle){
      return this.createToggleButton(button);
    }

    let elements = new Array();

    if (button.icon){
      elements.push(createIcon(button.icon));
    }
    if (button.caption){
      elements.push(createText(button.caption));
    }

    let options = {}

    if (button.title){
      options["tooltip"] = {
        subscriptions: this.subscriptions,
        title: button.title
      }
    }

    if (button.handler){
        options["click"] = button.handler
    }

    return createButton(options, [elements]);

  }

  //<label class='input-label'>   <input class='input-toggle' type='checkbox' checked> Toggle</label>
  protected createToggleButton(button:UIToolbarButton):HTMLElement{
    let innerElements = new Array();

    let options = {}

    if (button.title){
      options["tooltip"] = {
        subscriptions: this.subscriptions,
        title: button.title
      }
    }
    if (button.handler){
        options["click"] = button.handler
    }

    let inputToggleEl = createElement('input',{
      className : 'input-toggle',
      tooltip: {
        subscriptions: this.subscriptions,
        title: button.title
      }
    })
    inputToggleEl.type = 'checkbox'
    if (button.checked){
      inputToggleEl.setAttribute('checked','')
    }
    innerElements.push(inputToggleEl)

    if (button.caption){
      innerElements.push(createText(button.caption));
    }

    let className = 'input-label';
    if (button.className){
      className += ' ' + button.className;
    }

    return createElement('label', {
      className: className,
      elements: innerElements || options,
      options
    });

  }


}
