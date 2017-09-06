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
import { Logger } from '../logger/Logger'

const md5 = require('md5');

export interface PaneViewOptions {
  id:string;
  title:string;
  location?:string;
  userData?:any;
  activatePane:boolean;
  searchAllPanes:boolean;
  getURI:Function;
  getTitle:Function;
}

export class UIPane {

  public static get PANE_URI_PREFIX():string { return "deworkbench://" }

  private domEl:HTMLElement;
  protected mainElement:HTMLElement;
  protected item: any;
  protected atomTextEditor: any;
  private _options:PaneViewOptions;
  private _events:EventEmitter;
  private _title:string;

  constructor(options:PaneViewOptions){
    this._options = options;
    this._events = new EventEmitter()
    this._title = this._options.getTitle();
    console.log("UIPane creating for ", this._options.id);
    // Initialize the UI
    this.initUI();
  }

  private initUI(){

    // Create the main UI
    this.mainElement = this.createUI();

    let el = createElement('div', {
        elements: [
          this.mainElement
        ],
        className: 'de-workbench-pane-view'
    });

    this.domEl = el;
  }

  protected createUI():HTMLElement {
      // you need to subclass and override this method
      throw ("Invalid implementation")
  }

  public didOpen(){
    //nop, overridable
  }

  public destroy(){
    this.mainElement.remove();
    this.domEl.remove();
  }

  public setTitle(title:string){
    this._title = title;
    this.fireEvent('did-change-title', title)
  }

  public get paneId():string {
    return this._options.id;
  }

  public get options():PaneViewOptions {
    return this._options;
  }

  public static hashString(value:string):string {
      return md5(value)
  }

  getTitle():string {
    return this._title;
  }

  public get element():HTMLElement {
    return this.domEl;
  }

  public getURI(){
    return  this._options.getURI();
  }

  protected fireEvent(event, ...params){
    this._events.emit(event, params)
  }

}
