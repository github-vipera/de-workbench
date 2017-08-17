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
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UIInputFormElement, UIInputWithButtonFormElement, UIInputBrowseForFolderFormElement, FormType } from '../../ui-components/UIInputFormElement'
import { UICommonsFactory, FormActionsOptions, FormActionType } from '../../ui-components/UICommonsFactory'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'

export class PushSettingsView extends UIBaseComponent {

  projectRoot:string;
  private stackedPage: UIStackedView;

  constructor(projectRoot:string){
    super();
    this.projectRoot = projectRoot;
    this.initUI();
  }

  protected initUI(){
    let form = this.createForm();

    let sectionContainer = createElement('div',{
      elements: [ form ],
      className: 'section-container'
    })

    let innerPage = createElement('div',{
      elements: [ sectionContainer ],
      className: 'section'
    })

    this.stackedPage = new UIStackedView({
                          titleIconClass: 'icon-gear',
                          subtle: 'This tool allows you to send notifications to a device list'
                        })
                        .setTitle('Push Settings')
                        .setInnerView(innerPage)
                        .addHeaderClassName('de-workbench-stacked-view-header-section-thin');

    this.mainElement = this.stackedPage.element();

  }

  protected createForm(){

    let formElements = this.createFormElements();
    let ulEl = createElement('ul',{
      elements: [ formElements ],
      className: 'flex-outer'
    })

    let formEl = createElement('form',{
      elements: [ ulEl ]
    })

    return formEl;
  }

  protected createFormElements():Array<HTMLElement>{
    let apnSectionTitle = UICommonsFactory.createFormSectionTitle('Apple APN')
    let iosPemCertPathCrtl = new UIInputBrowseForFolderFormElement({ caption: 'PEM Cert. Path', placeholder: 'Enter .pem certificate path here', formType:FormType.FlexForm });
    let iosPemKeyPathCrtl = new UIInputBrowseForFolderFormElement({ caption: 'PEM Key. Path', placeholder: 'Enter .pem key path here', formType:FormType.FlexForm });
    let iosPassphraseCrtl = new UIInputFormElement({ caption: 'Passphrase', placeholder: 'Enter passphrase here', password:true, formType:FormType.FlexForm });
    let divider = UICommonsFactory.createFormSeparator();
    let gcmSectionTitle = UICommonsFactory.createFormSectionTitle('Google GCM')
    let gcmApiKeyCrtl = new UIInputFormElement({ caption: 'API Key', placeholder: 'Enter GCM API key here', formType:FormType.FlexForm });

    return [ apnSectionTitle,
            iosPemCertPathCrtl.element(),
            iosPemKeyPathCrtl.element(),
            iosPassphraseCrtl.element(),
            divider,
            gcmSectionTitle,
            gcmApiKeyCrtl.element()
           ]
  }

}
