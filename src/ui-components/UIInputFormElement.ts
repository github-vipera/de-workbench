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
import { UIComponent, UIBaseComponent } from '../ui-components/UIComponent'
import { UISelect, UISelectItem, UISelectListener } from '../ui-components/UISelect'


export class UIInputFormElement extends UIBaseComponent {

  private label:HTMLElement;
  private inputEditor:HTMLElement;
  private listeners:Array<Function>;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){

    this.label = createElement('label', {
      elements: [
      ]
    })
    this.inputEditor = this.createInputEditor();
    /**
    this.inputEditor = createElement('atom-text-editor', {
    })
    this.inputEditor.setAttribute('mini','');
    this.inputEditor.setAttribute('tabindex','-1');
    **/

    this.mainElement = createElement('div',{
      elements: [
        this.label,
        this.inputEditor
      ],
      className: 'block control-group'
    })
  }

  protected createInputEditor():HTMLElement {
    let inputEditor = createElement('atom-text-editor', {
    })
    inputEditor.setAttribute('mini','');
    inputEditor.setAttribute('tabindex','-1');
    return inputEditor;
  }

  public setCaption(caption:string):UIInputFormElement{
      this.label.innerText = caption;
      return this;
  }

  public setValue(value:string):UIInputFormElement{
    this.getModel().setText(value)
      return this;
  }

  public getValue():string{
    return this.getModel().getText()
  }

  public setWidth(width:string):UIInputFormElement{
    this.mainElement.style.width = width
    return this;
  }

  public setPlaceholder(placeholder:string):UIInputFormElement{
    this.getModel().setPlaceholderText(placeholder)
    return this;
  }

  private getModel(){
    return this.inputEditor['getModel']();
  }

  public addChangeListener(listener):UIInputFormElement{
    if (!this.listeners){
      this.listeners = new Array()
      this.getModel().emitter.on('did-change', (evt)=>{
          for (var i=0;i<this.listeners.length;i++){
              this.listeners[i](this);
          }
      })
    }
    this.listeners.push(listener);
    return this;
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
