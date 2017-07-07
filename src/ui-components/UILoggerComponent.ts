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
import { UIToolbar, UIToolbarButton } from './UIToolbar'

export class UILoggerComponent extends UIBaseComponent {

  public readonly autoscroll:boolean = true;
  private toolbar:UILoggerToolbarComponent;
  private loglines:HTMLElement;

  constructor(){
      super();
      this.buildUI();
  }

  private buildUI(){
    this.toolbar = new UILoggerToolbarComponent();

    this.loglines = createElement('div',{
      className: "de-workbench-uilogger-loglines"
    })

    this.mainElement = createElement('div',{
      elements: [
        this.toolbar.element(),
        this.loglines
      ],
      className: "de-workbench-uilogger-container"
    })
  }


  public addLog(message:string, className?:string):UILoggerComponent{
    let el = this.createLogLineElement(message, className);
    this.loglines.appendChild(el);
    this.updateScroll();
    return this;
  }

  private createLogLineElement(message:string, className?:string):HTMLElement {
    return createElement('div',{
      elements: [
        createElement('div',{
          elements : [
            createText(message)
          ],
          className: "de-workbench-uilogger-logline-message"
        })
      ],
      className: "de-workbench-uilogger-logline " + (className?className:'')
    })
  }

  public updateScroll():UILoggerComponent{
    if (this.autoscroll){
      this.mainElement.scrollTop = this.mainElement.scrollHeight;
    }
    return this;
  }

  public setAutoscroll(autoscroll:boolean):UILoggerComponent{
    return this;
  }

  public applyFilter(filter:string){
    //TODO!!
  }

  public search(search:string){
    //TODO!!
  }

}

class UILoggerToolbarComponent extends UIToolbar {

    constructor(){
      super();
      this.setupToolbar();
    }

    private setupToolbar(){
      let testButton = new UIToolbarButton()
                        .setId('test')
                        .setCaption('Test Button')
                        .setTitle('Test Button');
      this.addButton(testButton);

      let testButton2 = new UIToolbarButton()
                        .setId('test2')
                        .setCaption('Test Button2')
                        .setTitle('Test Button2');
      this.addRightButton(testButton2);
    }

}
