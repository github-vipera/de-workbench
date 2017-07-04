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
      this.pluginListModel.addPlugin(pluginInfo);
      this.modelChanged();
    }

    public addPlugins(plugins:Array<CordovaPlugin>){
      this.pluginListModel.addPlugins(plugins);
      this.modelChanged();
    }

}


class PluginsListModel implements UIListViewModel {

  private pluginList:Array<UIPluginItem>;

  constructor(){
      this.pluginList = new Array<UIPluginItem>();
  }

  public addPlugins(plugins:Array<CordovaPlugin>){
    let i = 0;
    for (i=0;i<plugins.length;i++){
      this.addPlugin(plugins[i]);
    }
  }

  public addPlugin(pluginInfo:CordovaPlugin){
    let pluginItem = new UIPluginItem(pluginInfo);
    this.pluginList.push(pluginItem)
  }

  hasHeader():boolean {
    return false;
  }
  getRowCount():number {
    return this.pluginList.length;
  }
  getColCount():number {
    return 1;
  }

  getElementAt(row:number, col:number):HTMLElement {
    return this.pluginList[row].element();
  }

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
    return 'de-workbench-plugins-list';
  }
}


class UIPluginItem extends UIBaseComponent {

    public readonly pluginInfo:CordovaPlugin;

    constructor(pluginInfo:CordovaPlugin){
      super();
      this.pluginInfo = pluginInfo;
      this.buildUI();
    }

    private buildUI(){
      this.mainElement = createElement('div',{
        elements : [
            createText(this.pluginInfo.name)
        ],
        className: 'de-workbench-plugins-list-item'
      });

    }

}
