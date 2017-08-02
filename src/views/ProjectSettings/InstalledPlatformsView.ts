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
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UIListView, UIListViewModel } from '../../ui-components/UIListView'
import * as _ from 'lodash'
import { UIButtonMenu } from '../../ui-components/UIButtonMenu'

export class InstalledPlatformsView extends UIBaseComponent {

  private mainFormElement:HTMLElement;
  private installedPlatformList: UIListView;
  private installedPlatformListModel : InstalledPlatformListModel;
  private currentProjectPath:string;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){

    this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();

    // ============================================================================
    // Installed platform list
    this.installedPlatformListModel = new InstalledPlatformListModel(this.currentProjectPath);
    this.installedPlatformList = new UIListView(this.installedPlatformListModel);
    var listCtrl = this.createListControlBlock("", this.installedPlatformList)
    // ============================================================================


    // ============================================================================
    // Install new platform button
    let btnInstallNewPlatform = new UIButtonMenu()
                                      .setCaption('Install New Platform...')
                                      .setInfoMessage('Select a new Platform to install')
                                      .setOnSelectionListener((menuItem)=>{
                                        alert("You have selected " + menuItem.value)
                                      })
    btnInstallNewPlatform.setMenuItems([ {value:'ios', displayName:'iOS'},
                                         {value:'android', displayName: 'Android'},
                                         {value:'browser', displayName: 'Browser'}])
    let installNewPatformCtrl = createElement('div',{
      elements: [
        btnInstallNewPlatform.element()
      ],
      className: 'install-platform-ctrl'
    })
    // ============================================================================



    this.mainFormElement = createElement('form',{
      elements: [
        listCtrl,
        installNewPatformCtrl
      ],
      className: 'de-workbench-appinfo-form installed-platforms-form'
    });
    this.mainFormElement.setAttribute("tabindex", "-1")
    this.mainElement = this.mainFormElement;

    this.installedPlatformListModel.reload(()=>{
      this.installedPlatformList.modelChanged();
    })

  }

  createListControlBlock(caption:string, control:UIListView):HTMLElement{
    var label = createElement('label', {
      elements: [
        createText(caption)
      ]
    })

    var blockElement = createElement('div',{
      elements: [
        label,
        control.element()
      ],
      className: 'block control-group'
    })
    return blockElement;
  }



}

class InstalledPlatformListModel implements UIListViewModel {

  projectPath:string;
  platforms:Array<CordovaPlatform>;
  platformElements:any;

  constructor(projectPath:string){
    this.projectPath = projectPath;
  }

  hasHeader():boolean {
      return false;
  }

  getRowCount():number {
    if (this.platforms){
      return this.platforms.length;
    } else {
      return 0;
    }
  }

  getColCount():number {
    return 1;
  }

  getElementAt?(row:number, col:number):HTMLElement {
    return this.getRenderer(row).element();
  }

  getValueAt(row:number, col:number):any {
      return this.platforms[row].name;
  }

  getClassNameAt(row:number, col:number):string {
    return "";
  }

  getColumnName(col:number):string {
    return "";
  }

  getClassName():string {
    return "installed-platform-list";
  }

  private getRenderer(row:number):PlatformRenderer {
      if (this.platformElements[""+row]){
        return this.platformElements[""+row];
      } else {
        var renderer = this.createRenderer(row);
        this.platformElements[""+row] = renderer;
        return renderer;
      }
  }

  private createRenderer(row:number):PlatformRenderer {
    var platformInfo:CordovaPlatform = this.platforms[row];
    var ret = new PlatformRenderer(platformInfo);
    return ret;
  }

  public reload(didDone:Function){
    ProjectManager.getInstance().cordova.getInstalledPlatforms(this.projectPath).then((ret)=>{
      this.platforms = ret;
      this.platformElements = {};
      didDone();
    });
  }

}

class PlatformRenderer extends UIBaseComponent {

  platformInfo:CordovaPlatform;

  constructor(platformInfo:CordovaPlatform){
    super();
    this.platformInfo = platformInfo;
    this.buildUI();
  }

  private buildUI(){
    var iconDiv = createIcon(this.platformInfo.name)
    iconDiv.classList.add("platform-icon")

    var platformNameDiv = createElement('div',{
          elements: [
            createText(PlatformUtils.toPlatformDisplayName(this.platformInfo.name))
          ],
          className: 'platform-name'
    })

    var platformVersionDiv = createElement('div',{
          elements: [
            createText(this.platformInfo.version)
          ],
          className: 'platform-version'
    })

    let btnManualInstall:HTMLElement = createElement('button',{
          elements: [
            createText("Remove")
          ],
          className: 'btn inline-block-tigh btn-uninstall-platform'
        })
      btnManualInstall.addEventListener('click',(evt)=>{
        console.log('Uninstall platforms selected: ', this.platformInfo);
      });

    this.mainElement = createElement('div',{
        elements: [
          iconDiv,
          platformNameDiv,
          platformVersionDiv,
          btnManualInstall
        ],
        className : 'platform-renderer'
      }
    )

  }

}

class PlatformUtils {
  public static toPlatformDisplayName(platformName:string){
    if (platformName==='ios'){
      return "iOS";
    }
    else if (platformName==='android'){
      return "Android";
    }
    else if (platformName==='browser'){
      return "Browser";
    }
  }
}



/**
 initialize: ->
   super
   @addClass('overlay from-top')
   @setItems(['Hello', 'World'])
   @panel ?= atom.workspace.addModalPanel(item: this)
   @panel.show()
   @focusFilterEditor()

 viewForItem: (item) ->
   "<li>#{item}</li>"

 confirmed: (item) ->
   console.log("#{item} was selected")

 cancelled: ->
   console.log("This view was cancelled")
   **/
