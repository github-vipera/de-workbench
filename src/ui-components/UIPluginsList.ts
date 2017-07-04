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
import { UIListView, UIListViewModel  } from './UIListView'
import { CordovaPlugin } from '../cordova/Cordova'

export class UIPluginsList extends UIListView {

    private pluginListModel: PluginsListModel;

    constructor(){
        super(null);
        this.pluginListModel =  new PluginsListModel();
        this.setModel(this.pluginListModel);
    }

    public addPlugin(pluginInfo:CordovaPlugin){
      //TODO!!
    }

}


class PluginsListModel implements UIListViewModel {
  hasHeader():boolean {
    return false;
  }
  getRowCount():number {
    return 10; //TODO!!
  }
  getColCount():number {
    return 1;
  }
  getElementAt?(row:number, col:number):HTMLElement;
  getValueAt(row:number, col:number):any {
    return row + "_" + col;
  }
  getClassNameAt(row:number, col:number):string {
    return '';
  }
  getColumnName(col:number):string {
    return '';
  }
  getClassName():string {
    return '';
  }
}
