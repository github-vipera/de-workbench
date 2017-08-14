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
import { EventEmitter }  from 'events'

const moment = require('moment')
const _ = require("lodash");


export interface DisplayConfiguration {
  ratingVisible: boolean,
  lastUpdateVisible: boolean,
  platformsVisible: boolean,
  authorVisible: boolean
}

export class UIPluginsList extends UIListView {

    private pluginListModel: PluginsListModel;
    //private callbackFunc:Function;
    private displayConfiguration:DisplayConfiguration;
    private events:EventEmitter;

    constructor(){
        super(null);
        this.events = new EventEmitter();

        this.displayConfiguration = {
          ratingVisible: true,
          lastUpdateVisible: true,
          platformsVisible: true,
          authorVisible: true
        }

        this.initModel();
    }

    private initModel(){
      this.pluginListModel =  new PluginsListModel(this.displayConfiguration).addEventListener('didActionRequired',(pluginInfo, actionType)=>{
        this.events.emit('didActionRequired', pluginInfo, actionType)
        /**
        if (this.callbackFunc){
          this.callbackFunc(pluginInfo, actionType)
        }
        **/
      });
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

    /**
    public setEventListener(callbackFunc:Function):UIPluginsList{
      this.callbackFunc = callbackFunc;
      return this;
    }
    **/

    public setPluginInstallPending(pluginInfo:CordovaPlugin,installing:boolean){
      this.pluginListModel.setPluginInstallPending(pluginInfo, installing);
    }

    public setPluginUInstallPending(pluginInfo:CordovaPlugin,unistalling:boolean){
      this.pluginListModel.setPluginUInstallPending(pluginInfo, unistalling);
    }

    public setRatingVisible(visible:boolean):UIPluginsList{
      this.displayConfiguration.ratingVisible = visible;
      this.updateUI();
      return this;
    }

    public setLastUpdateVisible(visible:boolean):UIPluginsList{
      this.displayConfiguration.lastUpdateVisible = visible;
      this.updateUI();
      return this;
    }

    public setPlatformsVisible(visible:boolean):UIPluginsList{
      this.displayConfiguration.platformsVisible = visible;
      this.updateUI();
      return this;
    }

    private updateUI(){
      this.pluginListModel.updateUI(this.displayConfiguration);
    }

    public addEventListener(event:string, listener):UIPluginsList{
      this.events.addListener(event, listener);
      return this;
    }

    public removeEventListener(event:string, listener):UIPluginsList{
      this.events.removeListener(event, listener);
      return this;
    }

    public destroy(){
      this.events.removeAllListeners();
      super.destroy();
      this.events = null;
    }

}

class PluginsListModel implements UIListViewModel {

  private pluginList:Array<UIPluginItem>;
  private pluginsMap:any={};
  //private callbackFunc:Function;
  private displayConfiguration:DisplayConfiguration;
  private events:EventEmitter;

  constructor(displayConfiguration:DisplayConfiguration){
    this.events = new EventEmitter();
    this.pluginList = new Array<UIPluginItem>();
    this.displayConfiguration = displayConfiguration;
  }

  public addPlugins(plugins:Array<CordovaPlugin>){
    let i = 0;
    for (i=0;i<plugins.length;i++){
      this.addPlugin(plugins[i]);
    }
    this.fireModelChanged();
  }

  public addPlugin(pluginInfo:CordovaPlugin){
    let pluginItem = new UIPluginItem(pluginInfo, this.displayConfiguration);
    pluginItem.setEventListener((pluginInfo, actionType)=>{
      this.fireActionEvent(pluginInfo, actionType)
      /**
      if (this.callbackFunc){
        this.callbackFunc(pluginInfo, actionType);
      }
      **/
    })
    this.pluginList.push(pluginItem)
    this.pluginsMap[pluginInfo.id] = pluginItem;
    this.fireModelChanged();
  }

  /**
  public setEventListener(callbackFunc:Function):PluginsListModel{
    this.callbackFunc = callbackFunc;
    return this;
  }
  **/

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
    this.pluginsMap = {};
    this.fireModelChanged()
  }

  public setPluginInstallPending(pluginInfo:CordovaPlugin,installing:boolean){
    let pluginItem:UIPluginItem = this.pluginsMap[pluginInfo.id];
    if (pluginItem){
      pluginItem.setPluginInstallPending(installing);
    }
  }

  public setPluginUInstallPending(pluginInfo:CordovaPlugin,unistalling:boolean){
    let pluginItem:UIPluginItem = this.pluginsMap[pluginInfo.id];
    if (pluginItem){
      pluginItem.setPluginUInstallPending(unistalling);
    }
  }

  public updateUI(displayConfiguration:DisplayConfiguration){
    this.displayConfiguration = displayConfiguration;
    for (var i=0;i<this.pluginList.length;i++){
      this.pluginList[i].updateUI(displayConfiguration)
    }
  }

  protected fireActionEvent(pluginInfo:CordovaPlugin, actionType){
    this.events.emit("didActionRequired", pluginInfo, actionType)
  }

  protected fireModelChanged(){
    this.events.emit("didModelChanged", this)
  }

  addEventListener(event:string, listener):PluginsListModel{
    this.events.addListener(event, listener)
    return this;
  }

  removeEventListener(event:string, listener):PluginsListModel{
    this.events.removeListener(event, listener)
    return this;
  }

  destroy(){
    this.events.removeAllListeners()
    this.events = null;
  }

}

export class UIPluginItem extends UIBaseComponent {

    public readonly pluginInfo:CordovaPlugin;

    private statsEl: HTMLElement;
    private callbackFunc:Function;
    private metSection:UIPluginMetaSection;
    private bodySection:UIPluginBodySection;
    private statsSection:UIPluginStatsSection;
    private displayConfiguration:DisplayConfiguration;

    constructor(pluginInfo:CordovaPlugin, displayConfiguration:DisplayConfiguration){
      super();
      this.pluginInfo = pluginInfo;
      this.displayConfiguration = displayConfiguration;
      this.buildUI();
    }

    private buildUI(){

      // BODY PART ========================================================================
      this.bodySection = new UIPluginBodySection(this.pluginInfo, this.displayConfiguration);


      // META PART ========================================================================
      this.metSection = new UIPluginMetaSection(this.pluginInfo, this.displayConfiguration).setEventListener((plugin, actionType)=>{
        if (this.callbackFunc){
          this.callbackFunc(plugin,actionType)
        }
      });


      // STATS PART ========================================================================
      this.statsSection = new UIPluginStatsSection(this.pluginInfo, this.displayConfiguration);


      this.mainElement = createElement('div',{
        elements : [
            this.statsSection.element(), this.bodySection.element(), this.metSection.element()
        ],
        className: 'de-workbench-plugins-list-item'
      });
    }

    public updateUI(displayConfiguration:DisplayConfiguration){
      this.displayConfiguration = displayConfiguration;
      this.metSection.updateUI(displayConfiguration);
      this.bodySection.updateUI(displayConfiguration);
      this.statsSection.updateUI(displayConfiguration);
    }

    public setEventListener(callbackFunc:Function):UIPluginItem{
      this.callbackFunc = callbackFunc;
      return this;
    }

    public setPluginInstallPending(installing:boolean){
      this.bodySection.setPluginInstallPending(installing)
      this.metSection.setPluginInstallPending(installing)
      this.statsSection.setPluginInstallPending(installing)
    }

    public setPluginUInstallPending(unistalling:boolean){
      this.bodySection.setPluginUInstallPending(unistalling)
      this.metSection.setPluginUInstallPending(unistalling)
      this.statsSection.setPluginUInstallPending(unistalling)
    }

}

export class UIPluginSection extends UIBaseComponent {

  protected pluginInfo:CordovaPlugin;
  protected displayConfiguration:DisplayConfiguration;

  constructor(pluginInfo:CordovaPlugin, displayConfiguration:DisplayConfiguration){
    super();
    this.displayConfiguration = displayConfiguration;
    this.pluginInfo = pluginInfo;
    this.buildUI();
    this.updateUI(this.displayConfiguration);
  }

  protected buildUI(){
      //NOP, override in subclass
  }

  public updateUI(displayConfiguration:DisplayConfiguration){
    this.displayConfiguration = displayConfiguration;
  }

  public setPluginInstallPending(installing:boolean){
  }

  public setPluginUInstallPending(unistalling:boolean){
  }

  protected changeElementVisibility(element:HTMLElement, visible:boolean){
      if (!visible){
        element.style.visibility = "hidden"
      } else {
        element.style.visibility = "visible"
      }
  }

}

export class UIPluginStatsSection extends UIPluginSection {

  constructor(pluginInfo:CordovaPlugin, displayConfiguration:DisplayConfiguration){
    super(pluginInfo, displayConfiguration);
  }

  protected buildUI(){
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

  public updateUI(displayConfiguration:DisplayConfiguration){
    super.updateUI(displayConfiguration);
    //NOP
  }

}

export class UIPluginBodySection extends UIPluginSection {

  private pluginUpdateDateEl:HTMLElement;

  constructor(pluginInfo:CordovaPlugin, displayConfiguration:DisplayConfiguration){
    super(pluginInfo, displayConfiguration);
  }

  protected buildUI(){
    super.buildUI();
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

    // Last Update
    let lastUpdateTimeStr = "Not Available";
    if (this.pluginInfo.lastUpdateTime){
      try {
        var date = new Date(this.pluginInfo.lastUpdateTime);
        lastUpdateTimeStr = moment(date).fromNow();
      } catch(ex){}
    }
    this.pluginUpdateDateEl = createElement('span',{
      elements: [
        createText("Last update: " + lastUpdateTimeStr)
      ]
    })
    this.pluginUpdateDateEl.className = "de-workbench-plugins-list-item-lastupdate";
    // end Last Update


    // Name
    let nameEl = createElement('h4', {
      elements: [
        pluginNameEl,
        pluginVersionEl,
        this.pluginUpdateDateEl
      ]
    })

    let descEl = createElement('span', {
      elements: [
        createText(this.pluginInfo.description)
      ]
    })
    descEl.className = "de-workbench-plugins-list-item-plugdesc";
    // end nameEl


    this.mainElement = createElement('div',{
      elements : [
          nameEl, descEl
      ]
    });

  }

  public updateUI(displayConfiguration:DisplayConfiguration){
    super.updateUI(displayConfiguration);
    this.changeElementVisibility(this.pluginUpdateDateEl ,displayConfiguration.lastUpdateVisible)
  }

}

export class UIPluginMetaSection extends UIPluginSection {

    protected callbackFunc:Function;
    protected metaButtons:UIPluginMetaButtons;
    protected ratingEl:HTMLElement;
    protected platformsEl:HTMLElement;

    constructor(pluginInfo:CordovaPlugin, displayConfiguration:DisplayConfiguration){
      super(pluginInfo, displayConfiguration);
    }

    protected buildUI(){
      super.buildUI();

      // Owner
      let userOwner  = this.pluginInfo.author
      let userOwnerEl:HTMLElement = createElement('a',{
        elements: [
          createText("by " + userOwner)
        ]
      });
      userOwnerEl.setAttribute("href", this.pluginInfo.homepage);
      userOwnerEl.className = "de-workbench-plugins-list-item-owner";
      // end Owner


      // Rating
      this.ratingEl = createElement('span',{
        elements: [
          createText(""+this.pluginInfo.rating)
        ],
        className:'badge badge-info de-workbench-plugins-list-item-rating'
      })
      // end Rating


      // Supported platforms
      this.platformsEl = this.renderPlatforms(this.pluginInfo.platforms);
      // end Supported platforms


      // Owner
      let metaUser = createElement('div',{
        elements : [ this.ratingEl, userOwnerEl, this.platformsEl ],
        className : 'de-workbench-plugins-list-meta-user'
      });
      // end Owner


      // Controls
      this.metaButtons = new UIPluginMetaButtons(this.pluginInfo, this.displayConfiguration);
       if (this.pluginInfo.installed){
         this.metaButtons.showButtons(UIPluginMetaButtons.BTN_TYPE_UNINSTALL)
                    .setButtonEnabled(UIPluginMetaButtons.BTN_TYPE_UNINSTALL, true);
       } else {
         this.metaButtons.showButtons(UIPluginMetaButtons.BTN_TYPE_INSTALL)
                    .setButtonEnabled(UIPluginMetaButtons.BTN_TYPE_INSTALL, true);
       }
      this.metaButtons.setEventListener((buttonClicked)=>{
        //alert("Clicked " + buttonClicked + " for " + this.pluginInfo.id);
        this.callbackFunc(this.pluginInfo, buttonClicked)
      });

      let metaControls = createElement('div',{
        elements : [
          createElement('div',{
            elements : [
              this.metaButtons.element()
            ],
            className : 'btn-toolbar'
          })
        ]
      });
      // end Controls


      this.mainElement = createElement('div',{
        elements : [
          metaUser, metaControls
        ],
        className: 'de-workbench-plugins-list-meta-cont'
      });
    }

    public setEventListener(callbackFunc:Function):UIPluginMetaSection{
      this.callbackFunc = callbackFunc;
      return this;
    }

    private renderPlatforms(platforms:Array<string>):HTMLElement {
      let textValue = "(" + _.map(platforms, 'displayName').join(",") +")";

      return createElement('span',{
       elements: [
         createText(textValue)
       ],
       className:'de-workbench-plugins-list-item-platforms'
     })
    }

    public setPluginInstallPending(installing:boolean){
      this.metaButtons.setPluginInstallPending(installing);
    }

    public setPluginUInstallPending(installing:boolean){
      this.metaButtons.setPluginUInstallPending(installing);
    }

    public updateUI(displayConfiguration:DisplayConfiguration){
      super.updateUI(displayConfiguration);
      this.metaButtons.updateUI(displayConfiguration)
      this.changeElementVisibility(this.ratingEl ,displayConfiguration.ratingVisible)
      this.changeElementVisibility(this.platformsEl ,displayConfiguration.platformsVisible)
    }


}

export class UIPluginMetaButtons extends UIPluginSection {

  public static readonly BTN_TYPE_INSTALL:number = 1;
  public static readonly BTN_TYPE_UNINSTALL:number = 2;

  private btnInstall:HTMLElement;
  private btnUninstall:HTMLElement;
  private callbackFunc:Function;

  private spinner:HTMLElement;

  constructor(pluginInfo:CordovaPlugin, displayConfiguration:DisplayConfiguration){
    super(pluginInfo, displayConfiguration);
  }

  public setEventListener(callbackFunc:Function){
    this.callbackFunc = callbackFunc;
  }

  protected buildUI(){
    super.buildUI();
    //<span class='loading loading-spinner-tiny inline-block'></span>
    this.spinner = createElement('span',{
      className: 'loading loading-spinner-small plugin-install-spinner'
    })
    this.spinner.style.visibility = "hidden"

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
        this.spinner
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

  public setPluginInstallPending(installing:boolean){
    if (installing){
      this.btnInstall.style.visibility = "hidden";
      this.spinner.style.visibility = "visible";
    } else {
      this.spinner.style.visibility = "hidden";
      this.btnInstall.style.visibility = "visible";
    }
  }

  public setPluginUInstallPending(unistalling:boolean){
    if (unistalling){
      this.btnUninstall.style.visibility = "hidden";
      this.spinner.style.visibility = "visible";
    } else {
      this.spinner.style.visibility = "hidden";
      this.btnUninstall.style.visibility = "visible";
    }
  }

  public updateUI(displayConfiguration:DisplayConfiguration){
    super.updateUI(displayConfiguration);
    //NOP
  }

}
