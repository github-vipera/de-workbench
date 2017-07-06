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



    // Platform Chooser Block
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





    // Search Form
    this.searchForm= createElement('div',{
        elements : [
          blockEditor,
          blockPlatformChooser
        ]
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


  }


}
