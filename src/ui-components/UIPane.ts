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
const crypto = require('crypto');

export interface PaneViewOptions {
  projectRoot:string;
  paneName:string;
  title:string;
  location?:string;
  userData?:any;
}

export class UIPane {

  private domEl:HTMLElement;
  protected paneName:string;
  protected projectRoot:string;
  protected projectId: string;
  protected mainElement:HTMLElement;
  protected item: any;
  protected atomTextEditor: any;
  protected options:PaneViewOptions;

  constructor(options:PaneViewOptions){
    this.options = options;
    this.paneName = options.paneName;
    this.projectRoot = options.projectRoot;
    this.projectId = crypto.createHash('md5').update(this.projectRoot).digest("hex");

    Logger.getInstance().debug("ProjectSettingsView creating for ",this.projectRoot, this.projectId);

    // Isnitialize the UI
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
  open () {
    Logger.getInstance().debug("Panel open called for ",this.projectRoot, this.projectId, this.paneName);
    if (this.item){
      atom.workspace["toggle"](this.item);
    } else {
      let locationStr = 'center'
      if (this.options.location){
        locationStr = this.options.location
      }
      const  prefix = "dewb";
      const uri = prefix + '//' + '_' +this.paneName +'_' + this.projectId;
      this.item = {
        activatePane: true,
        searchAllPanes: true,
        location: locationStr,
        element: this.domEl,
        getTitle: () => this.options.title,
        getURI: () => uri,
        destroy: ()=>{
          this.destroy()
        }
      };
      let atomWorkspace:any = atom.workspace;
      atomWorkspace["open"](this.item).then((view)=>{
          this.atomTextEditor = view;
      });
    }
  }

  public destroy(){
    this.mainElement.remove();
    this.domEl.remove();
  }


}
