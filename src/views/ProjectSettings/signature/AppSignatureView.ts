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
import { AbstractAppSignatureEditorCtrl } from './AbstractAppSignatureEditorCtrl'
import { IOSAppSignatureEditorCtrl } from './IOSAppSignatureEditorCtrl'
import { AndroidAppSignatureEditorCtrl } from './AndroidAppSignatureEditorCtrl'
import { UICommonsFactory, FormActionsOptions, FormActionType } from '../../../ui-components/UICommonsFactory'

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
      protected createEditorCtrl(appType:string){
        return new IOSAppSignatureEditorCtrl();
      }
    }();

    this.androidEditor = new class extends SignaturePlatformEditorCtrl {
      protected createEditorCtrl(appType:string){
        return new AndroidAppSignatureEditorCtrl();
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

  private debugEditCtrl:AbstractAppSignatureEditorCtrl;
  private releaseEditCtrl:AbstractAppSignatureEditorCtrl;
  private collapsiblePane:UICollapsiblePane;

  constructor(){
    super();
    this.initUI();
  }

  initUI(){
    this.debugEditCtrl = this.createEditorCtrl('debug');
    this.releaseEditCtrl = this.createEditorCtrl('release');

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
          //TODO!!
          //this.reload()
        } else if (actionType===FormActionType.Commit){
          //TODO!!
          //this.saveChanges()
        }
      }
    }
    let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt)

    let container = createElement('div',{
      elements: [this.collapsiblePane.element(), actionButtonsContainer]
    })
    container.style.width = "100%"
    
    this.mainElement = container;
  }

  protected createEditorCtrl(appType:string):AbstractAppSignatureEditorCtrl{
    return null;
  }

  public destroy(){
    this.debugEditCtrl.destroy();
    this.releaseEditCtrl.destroy();
    super.destroy();
  }

}
