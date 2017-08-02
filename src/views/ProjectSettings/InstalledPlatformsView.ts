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
import { UILineLoader } from '../../ui-components/UILineLoader'

export class InstalledPlatformsView extends UIBaseComponent {

  private mainFormElement:HTMLElement;
  private installedPlatformList: UIListView;
  private installedPlatformListModel : InstalledPlatformListModel;
  private currentProjectPath:string;
  private btnInstallNewPlatform: UIButtonMenu;
  private lineLoader: UILineLoader;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
    this.lineLoader = new UILineLoader()

    this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();

    // ============================================================================
    // Installed platform list
    this.installedPlatformListModel = new InstalledPlatformListModel(this.currentProjectPath)
                                      .setActionListener(this.doAction.bind(this));
    this.installedPlatformList = new UIListView(this.installedPlatformListModel);
    var listCtrl = this.createListControlBlock("", this.installedPlatformList, this.lineLoader)
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
                                            buttons: ['Yes, Install it', 'Cancel']
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

  doAction(platformInfo:CordovaPlatform, action:number){
    if (action===0){
      const selected = atom.confirm({
          message: 'Uninstall Platform',
          detailedMessage: "Are you sure you want to uninstall the " + PlatformUtils.toPlatformDisplayName(platformInfo.name) +" platform ?",
          buttons: ['Yes, Remove It', 'Cancel']
        });
        if (selected==0){
          this.doUninstallPlatform(platformInfo.name)
        }
    }
  }

  doUninstallPlatform(platformName:string){
    this.lineLoader.setOnLoading(true)
    ProjectManager.getInstance().cordova.removePlatform(this.currentProjectPath, platformName).then(()=>{
      UINotifications.showInfo("Platform "+ PlatformUtils.toPlatformDisplayName(platformName) +" uninstalled successfully.")
      this.reload()
      this.lineLoader.setOnLoading(false)
    }).catch((err)=>{
      UINotifications.showError("Error unistalling Platform "+ PlatformUtils.toPlatformDisplayName(platformName) +". See the logs for more details.")
      this.lineLoader.setOnLoading(false)
    })
  }

  doInstallPlatform(platformName:string){
    this.lineLoader.setOnLoading(true)
    ProjectManager.getInstance().cordova.addPlatform(this.currentProjectPath, platformName).then(()=>{
      UINotifications.showInfo("Platform "+ PlatformUtils.toPlatformDisplayName(platformName) +" installed successfully.")
      this.reload()
      this.lineLoader.setOnLoading(false)
    }).catch((err)=>{
      UINotifications.showError("Error adding Platform "+ PlatformUtils.toPlatformDisplayName(platformName) +". See the logs for more details.")
      this.lineLoader.setOnLoading(false)
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
    this.lineLoader.setOnLoading(true)
    this.installedPlatformListModel.reload(()=>{
      this.updateAvailableToInstallPlatforms();
      this.installedPlatformList.modelChanged();
      this.lineLoader.setOnLoading(false)
    })
  }

  createListControlBlock(caption:string, control:UIListView, loader:UILineLoader):HTMLElement{
    var label = createElement('label', {
      elements: [
        createText(caption)
      ]
    })

    var blockElement = createElement('div',{
      elements: [
        label,
        control.element(),
        loader.element()
      ],
      className: 'block control-group'
    })
    return blockElement;
  }

}

class InstalledPlatformListModel implements UIListViewModel {

  private projectPath:string;
  private platforms:Array<CordovaPlatform>;
  private platformElements:any;
  private actionListener:Function;

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

  setActionListener(actionListener:Function):InstalledPlatformListModel{
    this.actionListener = actionListener;
    return this;
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
    var ret = new PlatformRenderer(platformInfo, this.onItemAction.bind(this));
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

  onItemAction(platformInfo:CordovaPlatform, action:number){
    if (this.actionListener){
      this.actionListener(platformInfo, action)
    }
  }

}

class PlatformRenderer extends UIBaseComponent {

  private platformInfo:CordovaPlatform;
  private itemActionListener:Function;

  constructor(platformInfo:CordovaPlatform, itemActionListener:Function){
    super();
    this.itemActionListener = itemActionListener;
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
        if (this.itemActionListener){
          this.itemActionListener(this.platformInfo,0)
        }
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
