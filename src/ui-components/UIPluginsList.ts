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


export class UIPluginItem extends UIBaseComponent {

    public readonly pluginInfo:CordovaPlugin;

    constructor(pluginInfo:CordovaPlugin){
      super();
      this.pluginInfo = pluginInfo;
      this.buildUI();
    }

    private buildUI(){

      // BODY PART ========================================================================
      let nameEl = createElement('h4', {
        elements: [
          createElement('a', {
            elements : [
              createText(this.pluginInfo.name)
            ]
          }),
          createElement('span', {
            elements : [
              createText("1.2.3")
            ]
          })
        ]
      })

      let descEl = createElement('span', {
        elements: [
          createText(this.pluginInfo.description)
        ]
      })

      let bodyEl = createElement('div',{
        elements : [
            nameEl, descEl
        ]
      });
      // END BODY PART =====================================================================


      // STATS PART ========================================================================
      let stats = createElement('div', {
        elements: [
          createElement('span',{
            elements: [
              createText('pippo')
            ]
          })
        ],
        className : 'stats pull-right'
      })
      // END STATS PART =====================================================================





      // META PART ========================================================================
      let metaUser = createElement('div',{
        elements : [
          createElement('a',{
            elements : [
              createText("John Smith")
            ]
          })
        ],
        className : 'de-workbench-plugins-list-meta-user'
      });

      let metaButtons = new UIPluginMetaButtons()
                .showButtons(UIPluginMetaButtons.BTN_TYPE_UNINSTALL)
                .setButtonEnabled(UIPluginMetaButtons.BTN_TYPE_UNINSTALL, true);
      metaButtons.setEventListener((buttonClicked)=>{
        alert("Clicked " + buttonClicked + " for " + this.pluginInfo.id);
        // TODO!!
      });

      let metaControls = createElement('div',{
        elements : [
          createElement('div',{
            elements : [
              metaButtons.element()
            ],
            className : 'btn-toolbar'
          })
        ]
      });

      let metaEl = createElement('div',{
        elements : [
          metaUser, metaControls
        ],
        className: 'de-workbench-plugins-list-meta-cont'
      });
      // END META PART =====================================================================





      this.mainElement = createElement('div',{
        elements : [
            stats, bodyEl, metaEl
        ],
        className: 'de-workbench-plugins-list-item'
      });
    }

}


class UIPluginMetaButtons extends UIBaseComponent {

  public static readonly BTN_TYPE_INSTALL:number = 1;
  public static readonly BTN_TYPE_UNINSTALL:number = 2;

  private btnInstall:HTMLElement;
  private btnUninstall:HTMLElement;
  private callbackFunc:Function;

  constructor(){
    super();
    this.buildUI();
  }

  public setEventListener(callbackFunc:Function){
    this.callbackFunc = callbackFunc;
  }

  private buildUI(){
    this.btnInstall = this.buildButton('Install');
    this.btnInstall.className = this.btnInstall.className + " btn-info icon icon-cloud-download install-button";
    this.btnInstall.addEventListener('click', (evt)=>{
      this.callbackFunc(UIPluginMetaButtons.BTN_TYPE_INSTALL);
    });

    this.btnUninstall = this.buildButton('Uninstall');
    this.btnUninstall.className = this.btnUninstall.className + " icon icon-trashcan uninstall-button";
    this.btnUninstall.addEventListener('click', (evt)=>{
      this.callbackFunc(UIPluginMetaButtons.BTN_TYPE_UNINSTALL);
    });

    this.mainElement = createElement('div',{
      elements : [
        this.btnInstall,
        this.btnUninstall,
      ],
      className : 'btn-group'
    });
  }

  private buildButton(caption:string):HTMLElement {
    let btn:HTMLElement = createElement('button');
    btn.className = "btn de-workbench-plugins-list-meta-btn ";
    btn.textContent = caption;
    btn["disabled"] = true;
    return btn;
  }

  public showButtons(buttonType:number):UIPluginMetaButtons{
    if (buttonType==UIPluginMetaButtons.BTN_TYPE_INSTALL){
      this.btnInstall.style["display"] = 'initial';
      this.btnUninstall.style["display"] = 'none';
    } else if (buttonType==UIPluginMetaButtons.BTN_TYPE_UNINSTALL){
      this.btnUninstall.style["display"] = 'initial';
      this.btnInstall.style["display"] = 'none';
    } else if (buttonType==(UIPluginMetaButtons.BTN_TYPE_UNINSTALL|UIPluginMetaButtons.BTN_TYPE_INSTALL)){
      this.btnInstall.style["display"] = 'initial';
      this.btnUninstall.style["display"] = 'initial';
    } else {
      this.btnInstall.style["display"] = 'none';
      this.btnUninstall.style["display"] = 'none';
    }
    return this;
  }

  public setButtonEnabled(buttonType:number, enabled:boolean):UIPluginMetaButtons{
    if (buttonType==UIPluginMetaButtons.BTN_TYPE_INSTALL){
      this.btnInstall["disabled"] = !enabled;
    } else if (buttonType==UIPluginMetaButtons.BTN_TYPE_UNINSTALL){
      this.btnUninstall["disabled"] = !enabled;
    } else if (buttonType==(UIPluginMetaButtons.BTN_TYPE_UNINSTALL|UIPluginMetaButtons.BTN_TYPE_INSTALL)){
      this.btnInstall["disabled"] = !enabled;
      this.btnUninstall["disabled"] = !enabled;
    }
    return this;
  }

}
