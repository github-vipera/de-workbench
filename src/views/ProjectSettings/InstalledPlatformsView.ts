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
import { UINotifications } from '../../ui-components/UINotifications'

export class InstalledPlatformsView extends UIBaseComponent {

  private mainFormElement:HTMLElement;
  private installedPlatformList: UIListView;
  private installedPlatformListModel : InstalledPlatformListModel;
  private currentProjectPath:string;
  private btnInstallNewPlatform: UIButtonMenu;

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
    this.btnInstallNewPlatform = new UIButtonMenu()
                                      .setCaption('Install New Platform...')
                                      .setInfoMessage('Select a new Platform to install')
                                      .setEmptyMessage('  NOTE: No other platforms are available to install')
                                      .setOnSelectionListener((menuItem)=>{
                                        const selected = atom.confirm({
                                            message: 'Install New Platform',
                                            detailedMessage: 'Do you want to confirm the ' + menuItem.displayName +' platform installation ?',
                                            buttons: ['Yes, install it', 'Cancel']
                                          });
                                          if (selected==0){
                                            this.doInstallPlatform(menuItem.value);
                                          }
                                      })
    let installNewPatformCtrl = createElement('div',{
      elements: [
        this.btnInstallNewPlatform.element()
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

    this.reload();
  }

  doInstallPlatform(platformName:string){
    ProjectManager.getInstance().cordova.addPlatform(this.currentProjectPath, platformName).then(()=>{
      UINotifications.showInfo("Platform "+ PlatformUtils.toPlatformDisplayName(platformName) +" installed successfully.")
      this.reload()
    })
  }

  updateAvailableToInstallPlatforms(){
    // change available to install platforms
    var platforms = this.installedPlatformListModel.getCurrentPlatforms();

    var availableToInstall = [ {value:'ios', displayName:'iOS'},
                      {value:'android', displayName: 'Android'},
                      {value:'browser', displayName: 'Browser'}];

    // remove from list the already installed platforms
    for (var i=0;i<platforms.length;i++){
      _.remove(availableToInstall, {
          value: platforms[i].name
      });
    }

    this.btnInstallNewPlatform.setMenuItems(availableToInstall);
  }

  public reload(){
    this.installedPlatformListModel.reload(()=>{
      this.updateAvailableToInstallPlatforms();
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

  public getCurrentPlatforms():Array<CordovaPlatform>{
      return this.platforms;
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
