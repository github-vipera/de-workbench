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

export class AppSignatureView extends UIBaseComponent {

  private tabbedView: UITabbedView;
  private stackedPage: UIStackedView;
  private iosEditor:SignaturePlatformEditorCtrl;
  private androidEditor:SignaturePlatformEditorCtrl;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
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
    }();

    this.androidEditor = new class extends SignaturePlatformEditorCtrl {
      protected createEditorCtrl(appType:AppType){
        return new AndroidAppSignatureEditorCtrl(appType);
      }
    }();

    this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);

    this.tabbedView.addView(new UITabbedViewItem('ios',       'iOS',  this.iosEditor.element()));
    this.tabbedView.addView(new UITabbedViewItem('android',   'Android',  this.androidEditor.element()));

    this.stackedPage = new UIStackedView()
                        .setTitle('App Signature')
                        .setInnerView(this.tabbedView.element())
                        .addHeaderClassName('de-workbench-stacked-view-header-section-thin');

    this.mainElement = this.stackedPage.element();

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

  constructor(){
    super();
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
  }

  protected createEditorCtrl(appType:AppType):AbstractAppSignatureEditorCtrl{
    return null;
  }

  public destroy(){
    this.debugEditCtrl.destroy();
    this.releaseEditCtrl.destroy();
    super.destroy();
  }

}
