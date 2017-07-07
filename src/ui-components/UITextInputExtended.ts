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

export class UITextInputExtended extends UIBaseComponent {

  private buttonCaption:string;

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){
    this.mainElement = createElement('div',{
      elements : [],
      className : 'de-workbench-textinput-extended'
    })

    let inputEl = createElement('atom-text-editor',{
    })
    inputEl.classList.add("editor");
    inputEl.classList.add("mini");
    inputEl.classList.add("de-workbench-textinput-extended-editor")
    inputEl.classList.add('btn-group-xs');
    inputEl.setAttribute('data-grammar','text plain null-grammar')
    inputEl.setAttribute('mini','')

    let buttonEl = createElement('button',{
      elements: [
        createText('Browse...')
      ],
      className : 'btn'
    })
    buttonEl.classList.add('de-workbench-textinput-extended-btn')
    insertElement(inputEl, buttonEl);

    insertElement(this.mainElement, inputEl);
  }

  public setButtonCaption(caption:string){
    this.buttonCaption = caption;
  }


}
