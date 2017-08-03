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
   createTextEditor,
   createButtonSpacer
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
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'
import { UILineLoader } from '../../ui-components/UILineLoader'

export class CommunityPluginsView extends UIBaseComponent {

  private pluginList: UIPluginsList;
  private searchForm:HTMLElement;
  private searchTextEditor:HTMLElement;
  //private progress:HTMLElement;

  private btnGroupPlatformChooser: UIButtonGroup;
  private btnChooseIOS:HTMLElement;
  private btnChooseAndroid:HTMLElement;
  private btnChooseBrowser:HTMLElement;

  private lineLoader:UILineLoader;


  constructor(){
    super();

    let currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
    let cordova:Cordova = ProjectManager.getInstance().cordova;

    this.initUI();
  }

  protected initUI(){

    this.lineLoader = new UILineLoader()

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
    this.btnGroupPlatformChooser = new UIButtonGroup(UIButtonGroupMode.Toggle)
        .addButton(new UIButtonConfig().setId('ios').setCaption('iOS').setSelected(true))
        .addButton(new UIButtonConfig().setId('android').setCaption('Android').setSelected(true))
        .addButton(new UIButtonConfig().setId('browser').setCaption('Browser').setSelected(true));

    let btnManualInstall:HTMLElement = createElement('button',{
          elements: [
            createText("Install manually...")
          ],
          className: 'btn'
        })
      btnManualInstall.addEventListener('click',(evt)=>{
        console.log('Platforms selected: ', this.btnGroupPlatformChooser.getSelectedButtons());
      });
    // End Platform Chooser Block / Install manually


    let blockPlatformChooser = createElement('div',{
      elements: [
        this.btnGroupPlatformChooser.element(),
        createButtonSpacer(),
        btnManualInstall
      ],
      className : 'block'
    })

    // Search Form
    this.searchForm = createElement('div',{
        elements : [
          blockEditor,
          blockPlatformChooser
        ],
        className: 'de-workbench-community-plugins-search-form'
    });

    // Plugins list
    this.pluginList = new UIPluginsList();

    // Main element
    this.mainElement = createElement('div',{
        elements : [
          this.searchForm,
          this.pluginList.element(),
          this.lineLoader.element()
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
   * Submit the search to the npm registry
   */
  private submitSearch(){
    this.showProgress(true);
    let cpf = new CordovaPluginsFinder();
    let names = '';

    let platforms = this.btnGroupPlatformChooser.getSelectedButtons();

    let search = this.searchTextEditor["value"];
    let keywords = _.split(search, ' ');
    //let platforms = ['ios','android','browser'];

    cpf.search(keywords,keywords,platforms).then((results:Array<CordovaPlugin>)=>{
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
    this.lineLoader.setOnLoading(show);
  }

  /**
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
  **/

  public destroy(){
    this.pluginList.destroy()
    this.btnGroupPlatformChooser.destroy()
    super.destroy()
  }
}
