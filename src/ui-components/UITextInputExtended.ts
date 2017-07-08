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
  private buttonText:Text;
  private buttonElement:HTMLElement;
  private inputEl:HTMLElement;
  private editor;
  private buttonHandler;
  private editorHandler;

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){
    this.mainElement = createElement('div',{
      elements : [],
      className : 'de-workbench-textinput-extended'
    })

    this.inputEl = createElement('atom-text-editor',{
    })
    this.inputEl.classList.add("editor");
    this.inputEl.classList.add("mini");
    this.inputEl.classList.add("de-workbench-textinput-extended-editor")
    this.inputEl.classList.add('btn-group-xs');
    this.inputEl.setAttribute('data-grammar','text plain null-grammar')
    this.inputEl.setAttribute('mini','')
    this.editor = this.inputEl['getModel']()

    this.buttonText = createText('');
    this.buttonElement = createElement('button',{
      elements: [
        this.buttonText
      ],
      className : 'btn'
    })
    this.buttonElement.classList.add('de-workbench-textinput-extended-btn')
    insertElement(this.inputEl, this.buttonElement);

    insertElement(this.mainElement, this.inputEl);
  }

  public setTextPlaceholder(placeholder:string):UITextInputExtended {
    this.editor.setPlaceholderText(placeholder);
    return this;
  }

  public setButtonClassName(className:string):UITextInputExtended {
    this.buttonElement.classList.add(className)
    return this;
  }

  public setButtonCaption(caption:string):UITextInputExtended {
    this.buttonCaption = caption;
    this.buttonText.textContent = caption;
    return this;
  }

  public addButtonHandler(handler):UITextInputExtended {
    this.buttonHandler = handler;
    this.buttonElement.addEventListener('click',handler);
    return this;
  }

  public addEditorHandler(handler):UITextInputExtended {
    this.editorHandler = handler;
    this.inputEl.addEventListener('keyup', handler);
    return this;
  }

  public destroy(){
    super.destroy();
    if (this.buttonHandler){
      this.buttonElement.removeEventListener(this.buttonHandler);
    }
    if (this.editorHandler){
      this.inputEl.removeEventListener(this.editorHandler);
    }
    
  }




}
