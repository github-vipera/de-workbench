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
    let btnChooseIOS:HTMLElement = createElement('button',{
      elements: [
        createText("iOS")
      ],
      className: 'btn platform-select'
    })
    btnChooseIOS.setAttribute('platform' , 'ios');
    let btnChooseAndroid:HTMLElement = createElement('button',{
      elements: [
        createText("Android")
      ],
      className: 'btn platform-select'
    })
    btnChooseAndroid.setAttribute('platform' , 'android');
    let btnChooseBrowser:HTMLElement = createElement('button',{
      elements: [
        createText("Browser")
      ],
      className: 'btn platform-select'
    })
    btnChooseBrowser.setAttribute('platform' , 'browser');
    let groupsPlatformChooser = createElement('div',{
      elements: [
        btnChooseAndroid,
        btnChooseIOS,
        btnChooseBrowser
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

  }

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

  private showProgress(show:boolean){
    if (show){
      this.progress.style.display = "inherit";
    } else {
      this.progress.style.display = "none";
    }
  }


}
