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

  constructor(options:PaneViewOptions){
    this._options = options;
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

   /**
   * Open this view
   */
  // open () {
  //   Logger.getInstance().debug("Panel open called for ",this._options.id);
  //   if (this.item){
  //     atom.workspace["toggle"](this.item);
  //   } else {
  //     let locationStr = 'center'
  //     if (this._options.location){
  //       locationStr = this._options.location
  //     }
  //     const uri = UIPane.PANE_URI_PREFIX  + this._options.id;
  //     console.log("Opening UIPane [URI=" + uri +"]");
  //     this.item = {
  //       activatePane: this._options.activatePane,
  //       searchAllPanes: true, /*this._options.searchAllPanes,*/
  //       location: locationStr,
  //       element: this.domEl,
  //       getTitle: () => this._options.title,
  //       getURI: () => uri,
  //       destroy: ()=>{
  //         this.destroy()
  //       }
  //     };
  //     let atomWorkspace:any = atom.workspace;
  //     atomWorkspace["open"](uri, this.item).then((view)=>{
  //         this.atomTextEditor = view;
  //         this.afterOpen();
  //     });
  //   }
  // }

  protected afterOpen(){
    //nop, overridable
  }

  public destroy(){
    this.mainElement.remove();
    this.domEl.remove();
  }

  public setPaneTitle(title:string){
    //TODO!!
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

  getTitle() {
    return this._options.getTitle();
  }

  public get element():HTMLElement {
    return this.domEl;
  }

  public getURI(){
    return  this._options.getURI();
  }

}
