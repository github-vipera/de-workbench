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
 } from '../../element/index';

const _ = require("lodash");
const $ = require ('JQuery');

import { EventEmitter }  from 'events'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { Logger } from '../../logger/Logger'
import { UIPluginsList } from '../../ui-components/UIPluginsList'
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { CordovaPluginsFinder } from '../../cordova/CordovaPluginsFinder'

export class CommunityPluginsView extends UIBaseComponent {

  private pluginList: UIPluginsList;
  private searchForm:HTMLElement;
  private searchTextEditor:HTMLElement;
  private progress:HTMLElement;

  private btnChooseIOS:HTMLElement;
  private btnChooseAndroid:HTMLElement;
  private btnChooseBrowser:HTMLElement;


  constructor(){
    super();

    let currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
    let cordova:Cordova = ProjectManager.getInstance().cordova;

    this.initUI();
  }

  protected initUI(){

    // Editor Block
    this.searchTextEditor = createElement('input',{
      className: 'input-search native-key-bindings'
    });
    this.searchTextEditor["type"] = "search";
    this.searchTextEditor["placeholder"] = "Search a plugin";
    let blockEditor = createElement('div',{
      elements: [
        this.searchTextEditor
      ],
      className : 'block'
    })


    // Platform Chooser Block / Install manually
    this.btnChooseIOS = this.createPlatformSelectButton("iOS");
    this.btnChooseAndroid = this.createPlatformSelectButton("Android");
    this.btnChooseBrowser = this.createPlatformSelectButton("Browser");
    let groupsPlatformChooser = createElement('div',{
      elements: [
        this.btnChooseAndroid,
        this.btnChooseIOS,
        this.btnChooseBrowser
      ],
      className : 'btn-group'
    })
    let btnManualInstall:HTMLElement = createElement('button',{
      elements: [
        createText("Install manually...")
      ],
      className: 'btn pull-right'
    })
    let blockPlatformChooser = createElement('div',{
      elements: [
        groupsPlatformChooser,
        btnManualInstall
      ],
      className : 'block'
    })


    this.progress = createElement('progress',{
    });
    this.progress.style.width = "100%";

    // Search Form
    this.searchForm = createElement('div',{
        elements : [
          blockEditor,
          blockPlatformChooser,
          this.progress
        ],
        className: 'de-workbench-community-plugins-search-form'
    });

    // Plugins list
    this.pluginList = new UIPluginsList();

    // Main element
    this.mainElement = createElement('div',{
        elements : [
          this.searchForm,
          this.pluginList.element()
        ],
        className: 'de-workbench-community-plugins-list'
    })

    this.showProgress(false);

    //Add event listeners
    this.searchTextEditor.addEventListener('keypress',(evt)=>{
      if (evt.which == 13){
        this.submitSearch();
      }
    });

    $('[platform-select]').click(function(evt){
      $(evt.currentTaget).toggleClass("selected");
      alert("toggle");
    });
  }

  /**
   * Create a button for platform selection
   */
  private createPlatformSelectButton(platform:string):HTMLElement {
    let btn:HTMLElement = createElement('button',{
      elements: [
        createText(platform)
      ],
      className: 'btn platform-select selected'
    })
    btn.setAttribute('platform-select','')
    btn.setAttribute('platform' , platform);
    btn.addEventListener('click',(evt)=>{
      let el:any = evt.currentTarget;
      el.classList.toggle('selected');
      //alert(evt.currentTarget);
    });
    return btn;
  }

  /**
   * Submit the search to the npm registry
   */
  private submitSearch(){
    this.showProgress(true);
    let cpf = new CordovaPluginsFinder();
    let names = '';
    let platforms = '';

    let search = this.searchTextEditor["value"];
    let keywords = _.split(search, ' ');

    cpf.search(keywords,keywords,null).then((results:Array<CordovaPlugin>)=>{
      //alert(results);
      console.log("Plugins finder results: ", results);
      this.pluginList.setPlugins(results);
      this.showProgress(false);
    }, (err)=>{
      alert("Error: " + err);
      this.showProgress(false);
    });

  }

  /*
   * Show/Hide progress bar
   */
  private showProgress(show:boolean){
    if (show){
      this.progress.style.display = "inherit";
    } else {
      this.progress.style.display = "none";
    }
  }

  private getSelectedPlatforms():Array<string>{
    let ret:Array<string> = new Array();
    if (this.btnChooseIOS.classList.contains('selected')){
      ret.push("iOS");
    }
    if (this.btnChooseAndroid.classList.contains('selected')){
      ret.push("Android");
    }
    if (this.btnChooseBrowser.classList.contains('selected')){
      ret.push("Browser");
    }
    return ret;
  }

}
