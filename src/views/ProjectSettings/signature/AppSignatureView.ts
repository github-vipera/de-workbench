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
} from '../../../element/index';

import { EventEmitter }  from 'events'
import { ProjectManager } from '../../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../../cordova/Cordova'
import { Logger } from '../../../logger/Logger'
import { UIPluginsList } from '../../../ui-components/UIPluginsList'
import { UIStackedView } from '../../../ui-components/UIStackedView'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UICollapsiblePane } from  '../../../ui-components/UICollapsiblePane'
import { AbstractAppSignatureEditorCtrl, AppType } from './AbstractAppSignatureEditorCtrl'
import { IOSAppSignatureEditorCtrl } from './IOSAppSignatureEditorCtrl'
import { AndroidAppSignatureEditorCtrl } from './AndroidAppSignatureEditorCtrl'
import { UICommonsFactory, FormActionsOptions, FormActionType } from '../../../ui-components/UICommonsFactory'
import { IOSUtilities } from '../../../cordova/IOSUtilities'

const path = require('path');
const fs = require("fs")

export class AppSignatureView extends UIBaseComponent {

  private tabbedView: UITabbedView;
  private stackedPage: UIStackedView;
  private iosEditor:SignaturePlatformEditorCtrl;
  private androidEditor:SignaturePlatformEditorCtrl;
  private currentProjectPath:string;
  private buildJson:Object;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){

    this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();

    this.iosEditor = new class extends SignaturePlatformEditorCtrl {
      protected createEditorCtrl(appType:AppType){
        return new IOSAppSignatureEditorCtrl(appType);
      }
      protected createExtendedActions():HTMLElement {
        let reloadButton = createElement('button',{
          elements: [ createText('Reload Provisioning Profiles') ],
          className: 'btn icon icon-repo-sync'
        });
        reloadButton.addEventListener('click',()=>{
          this.reloadProvisioningProfiles();
        })
        return reloadButton;
      }
      protected async reloadProvisioningProfiles(){
        let provFiles = await IOSUtilities.loadProvisioningProfiles();
        let ctrl:any = this.debugEditCtrl;
        ctrl.reloadProvisioningProfiles(provFiles);
        ctrl = this.releaseEditCtrl;
        ctrl.reloadProvisioningProfiles(provFiles);
      }
      protected prepareForEdit(){
        super.prepareForEdit();
        this.reloadProvisioningProfiles();
      }
    }().addEventListener('didChanged',(editorCtrl:SignaturePlatformEditorCtrl)=>{
      this.writeBuildJson(editorCtrl.getBuildJson())
    });

    this.androidEditor = new class extends SignaturePlatformEditorCtrl {
      protected createEditorCtrl(appType:AppType){
        return new AndroidAppSignatureEditorCtrl(appType);
      }
    }().addEventListener('didChanged',(editorCtrl:SignaturePlatformEditorCtrl)=>{
      this.writeBuildJson(editorCtrl.getBuildJson())
    });

    this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);

    this.tabbedView.addView(new UITabbedViewItem('ios',       'iOS',  this.iosEditor.element()));
    this.tabbedView.addView(new UITabbedViewItem('android',   'Android',  this.androidEditor.element()));

    this.stackedPage = new UIStackedView({
                          titleIconClass: 'icon-shield'
                        })
                        .setTitle('App Signature')
                        .setInnerView(this.tabbedView.element())
                        .addHeaderClassName('de-workbench-stacked-view-header-section-thin');

    this.mainElement = this.stackedPage.element();

    this.reload();

  }

  protected updateUI(buildJson:any){
    this.iosEditor.updateUI(buildJson)
    this.androidEditor.updateUI(buildJson)
  }

  protected reload(){
    this.buildJson = this.reloadBuildJson();
    this.updateUI(this.buildJson);
  }

  protected getBuildJsonPath():string {
    return path.join(this.currentProjectPath, "build.json")
  }

  protected defaultBuildJson(){
      return {
        "ios" : {
          "debug" : {},
          "release" : {}
        },
        "android" : {
          "debug" : {},
          "release" : {}
        }
      };
  }

  protected reloadBuildJson(){
    let buildJsonPath = this.getBuildJsonPath()
    var exists = fs.existsSync(buildJsonPath);
    if (!exists){
      let buildJson = this.defaultBuildJson();
      this.writeBuildJson(buildJson);
      return buildJson;
    } else {
      return JSON.parse(fs.readFileSync(buildJsonPath, 'utf8'));
    }
  }


  protected writeBuildJson(buildJson:any){
    if (!buildJson){
      buildJson = this.buildJson;
    }
    var string = JSON.stringify(buildJson,null,'\t');
    fs.writeFile(this.getBuildJsonPath(),string,function(err) {
      if(err) return console.error(err);
        console.log('done');
    })
}

  public destroy(){
    this.tabbedView.destroy();
    this.stackedPage.destroy();
    this.iosEditor.destroy();
    this.androidEditor.destroy();
    super.destroy();
  }

}

class SignaturePlatformEditorCtrl extends UIBaseComponent {

  protected debugEditCtrl:AbstractAppSignatureEditorCtrl;
  protected releaseEditCtrl:AbstractAppSignatureEditorCtrl;
  protected collapsiblePane:UICollapsiblePane;
  protected buildJson:any;
  protected events:EventEmitter;

  constructor(){
    super();
    this.events = new EventEmitter();
    this.initUI();
    this.prepareForEdit();
  }

  initUI(){
    this.debugEditCtrl = this.createEditorCtrl(AppType.Debug);
    this.releaseEditCtrl = this.createEditorCtrl(AppType.Release);

    this.collapsiblePane = new UICollapsiblePane()

    this.collapsiblePane.addItem({
      collapsed:false,
      id: 'debug',
      caption: "Debug",
      subtle:"",
      view: this.debugEditCtrl.element()
    })
    .addItem({
      collapsed:false,
      id: 'release',
      caption: "Release",
      view: this.releaseEditCtrl.element()
    })


    let actionButtonsOpt:FormActionsOptions = {
      cancel : {
        caption : 'Revert Changes'
      },
      commit : {
        caption : 'Save Changes'
      },
      actionListener: (actionType:number)=>{
        if (actionType===FormActionType.Cancel){
          this.reload()
        } else if (actionType===FormActionType.Commit){
          this.saveChanges()
        }
      }
    }
    let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt)

    let extendedActions = this.createExtendedActions();
    if (extendedActions){
        insertElement(actionButtonsContainer, extendedActions)
    }

    let container = createElement('div',{
      elements: [this.collapsiblePane.element(), actionButtonsContainer],
      className: 'de-workbench-appsignature-control-container'
    })

    this.mainElement = container;
  }

  protected prepareForEdit(){}

  protected createExtendedActions():HTMLElement {
    return null;
  }

  public reload(){
    this.debugEditCtrl.reload();
    this.releaseEditCtrl.reload();
  }

  public saveChanges(){
    this.debugEditCtrl.saveChanges();
    this.releaseEditCtrl.saveChanges();
    //console.log("Build JSON:", this.buildJson)
    this.events.emit('didChanged', this);
  }

  protected createEditorCtrl(appType:AppType):AbstractAppSignatureEditorCtrl{
    return null;
  }

  public destroy(){
    this.events.removeAllListeners();
    this.debugEditCtrl.destroy();
    this.releaseEditCtrl.destroy();
    this.events = null;
    super.destroy();
  }

  public updateUI(buildJson:any){
    this.buildJson = buildJson;
    this.debugEditCtrl.setBuildJson(buildJson)
    this.releaseEditCtrl.setBuildJson(buildJson)
  }

  public addEventListener(event:string,listener):SignaturePlatformEditorCtrl{
    this.events.addListener(event, listener);
    return this;
  }

  public getBuildJson(){
    return this.buildJson;
  }

}
