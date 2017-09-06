'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
 import { EventEmitter }  from 'events'

export interface UIComponent {
  element():HTMLElement
}

const uuidv4 = require('uuid/v4');

export class UIBaseComponent implements UIComponent {

  protected mainElement: HTMLElement;
  protected uiComponentId: string;

  constructor(){
    this.uiComponentId = uuidv4();
  }

  public element(){
    return this.mainElement;
  }

  public uiComponentID(){
    return this.uiComponentId;
  }

  public destroy () {
    while (this.mainElement.hasChildNodes()) {
      this.mainElement.removeChild(this.mainElement.lastChild);
    }
    this.mainElement.remove();
    this.mainElement = undefined;
  }


}

export class UIExtComponent extends UIBaseComponent {

  private _events:EventEmitter;

  constructor(){
    super();
    this._events = new EventEmitter()
  }

  protected fireEvent(event, ...params){
    this._events.emit(event, params)
  }

  public addEventListener(event:string, listener){
      this._events.addListener(event,listener)
  }

  public removeEventListener(event:string, listener){
      this._events.removeListener(event,listener)
  }

  public destroy(){
    this._events.removeAllListeners();
    this._events = null;
    super.destroy()
  }

}
