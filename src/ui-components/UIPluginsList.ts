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
const moment = require('moment')

export class UIPluginsList extends UIListView {

    private pluginListModel: PluginsListModel;

    constructor(){
        super(null);
        this.initModel();
    }

    private initModel(){
      this.pluginListModel =  new PluginsListModel();
      this.setModel(this.pluginListModel);
    }

    public clearList(){
      this.pluginListModel.clear();
      this.modelChanged();
    }

    public addPlugin(pluginInfo:CordovaPlugin){
      this.pluginListModel.addPlugin(pluginInfo);
      this.modelChanged();
    }

    public addPlugins(plugins:Array<CordovaPlugin>){
      this.pluginListModel.addPlugins(plugins);
      this.modelChanged();
    }

    public setPlugins(plugins:Array<CordovaPlugin>){
      this.clearList();
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

  public clear(){
    this.pluginList = new Array<UIPluginItem>();
  }
}

export class UIPluginItem extends UIBaseComponent {

    public readonly pluginInfo:CordovaPlugin;

    private statsEl: HTMLElement;

    constructor(pluginInfo:CordovaPlugin){
      super();
      this.pluginInfo = pluginInfo;
      this.buildUI();
    }

    private buildUI(){

      // BODY PART ========================================================================
      let body = new UIPluginBodySection(this.pluginInfo);


      // META PART ========================================================================
      let meta = new UIPluginMetaSection(this.pluginInfo);


      // STATS PART ========================================================================
      let stats = new UIPluginStatsSection(this.pluginInfo);


      this.mainElement = createElement('div',{
        elements : [
            stats.element(), body.element(), meta.element()
        ],
        className: 'de-workbench-plugins-list-item'
      });
    }

}

class UIPluginStatsSection extends UIBaseComponent {

  public pluginInfo:CordovaPlugin;

  constructor(pluginInfo:CordovaPlugin){
    super();
    this.pluginInfo = pluginInfo;
    this.buildUI();
  }

  private buildUI(){
    this.mainElement = createElement('div', {
      elements: [
        createElement('span',{
          elements: [
            createText('TODO!!')
          ]
        })
      ],
      className : 'stats pull-right'
    })
    this.mainElement.style.display = 'none'
  }

}

class UIPluginBodySection extends UIBaseComponent {

  public pluginInfo:CordovaPlugin;

  constructor(pluginInfo:CordovaPlugin){
    super();
    this.pluginInfo = pluginInfo;
    this.buildUI();
  }

  private buildUI(){
    let pluginNameEl = createElement('a', {
      elements: [
        createText(this.pluginInfo.name)
      ]
    })
    pluginNameEl.className = "de-workbench-plugins-list-item-plugname";
    pluginNameEl.setAttribute('homepage', this.pluginInfo.homepage)
    pluginNameEl.setAttribute('href', this.pluginInfo.homepage)

    let pluginVersionEl = createElement('span', {
      elements: [
        createText("v" +this.pluginInfo.version)
      ]
    })
    pluginVersionEl.className = "de-workbench-plugins-list-item-plugversion";

    let lastUpdateTimeStr = "Not Available";
    if (this.pluginInfo.lastUpdateTime){
      try {
        var date = new Date(this.pluginInfo.lastUpdateTime);
        lastUpdateTimeStr = moment(date).fromNow();
      } catch(ex){}
    }
    let pluginUpdateDateEl = createElement('span',{
      elements: [
        createText("Last update: " + lastUpdateTimeStr)
      ]
    })
    pluginUpdateDateEl.className = "de-workbench-plugins-list-item-lastupdate";

    let nameEl = createElement('h4', {
      elements: [
        pluginNameEl,
        pluginVersionEl,
        pluginUpdateDateEl
      ]
    })

    let descEl = createElement('span', {
      elements: [
        createText(this.pluginInfo.description)
      ]
    })
    descEl.className = "de-workbench-plugins-list-item-plugdesc";

    this.mainElement = createElement('div',{
      elements : [
          nameEl, descEl
      ]
    });
  }

}

class UIPluginMetaSection extends UIBaseComponent {

    public pluginInfo:CordovaPlugin;
    private callbackFunc:Function;

    constructor(pluginInfo:CordovaPlugin){
        super();
        this.pluginInfo = pluginInfo;
        this.buildUI();
    }

    private buildUI(){
      let userOwner  = this.pluginInfo.author
      let userOwnerEl:HTMLElement = createElement('a',{
        elements: [
          createText("by " + userOwner)
        ]
      });
      userOwnerEl.setAttribute("href", this.pluginInfo.homepage);
      userOwnerEl.className = "de-workbench-plugins-list-item-owner";

      let ratingEl:HTMLElement = createElement('span',{
        elements: [
          createText(""+this.pluginInfo.rating)
        ],
        className:'badge badge-info de-workbench-plugins-list-item-rating'
      })


      let metaUser = createElement('div',{
        elements : [ ratingEl, userOwnerEl ],
        className : 'de-workbench-plugins-list-meta-user'
      });

      let metaButtons = new UIPluginMetaButtons()
                .showButtons(UIPluginMetaButtons.BTN_TYPE_UNINSTALL)
                .setButtonEnabled(UIPluginMetaButtons.BTN_TYPE_UNINSTALL, true);
      metaButtons.setEventListener((buttonClicked)=>{
        alert("Clicked " + buttonClicked + " for " + this.pluginInfo.id);
        // TODO!! notify listeners
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

      this.mainElement = createElement('div',{
        elements : [
          metaUser, metaControls
        ],
        className: 'de-workbench-plugins-list-meta-cont'
      });
    }

    public setEventListener(callbackFunc:Function){
      this.callbackFunc = callbackFunc;
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
      if (this.callbackFunc){
        this.callbackFunc(UIPluginMetaButtons.BTN_TYPE_UNINSTALL);
      }
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
