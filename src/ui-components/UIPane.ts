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
const $ = require('jquery')

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
  private _uri:string;
  private _el:HTMLElement;
  private _title:string;

  constructor(uri:string, title?:string){
    Logger.consoleLog("UIPane for URI:", uri);
    this._uri = uri;
    this._events = new EventEmitter()
    // create the default container to retrun to the factory
    this._el = createElement('div', {
        elements: [
        ],
        className: 'de-workbench-pane-view'
    });
    this.domEl = this._el;
    if (title){
      this.setTitle(title);
    }
  }

  /**
   * called by the ViewManager after instatiation
   */
  public init(options:PaneViewOptions){
    this._options = options;
    // Tell to the subclass to create the main UI and attach it to this container
    this.mainElement = this.createUI();
    insertElement(this._el, this.mainElement);
    Logger.consoleLog("UIPane initialized for ", this._options.id, {});
    //Logger.consoleLog("UIPane parent is", this.getAtomPane());
  }

  /**
   * Implementation required into the subclass
   **/
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
    this.updateTitleUI(title);
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
    return  this._uri;
  }

  protected fireEvent(event, ...params){
    this._events.emit(event, params)
  }

  protected getAtomPane():any {
    return $(this._el).parent().parent();
  }

  protected updateTitleUI(title:string){
    try {
      let tabTitleEl = this.getAtomPane().find('.tab-bar').find('.tab').find('.title');
      tabTitleEl.html(title);
    } catch (ex){
      Logger.consoleLog("updateTitleUI error: ", ex);
    }

  }

}
