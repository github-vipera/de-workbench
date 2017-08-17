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

export class PushSettingsView extends UIBaseComponent {

  projectRoot:string;
  private stackedPage: UIStackedView;

  constructor(projectRoot:string){
    super();
    this.projectRoot = projectRoot;
    this.initUI();
  }

  protected initUI(){
    let innerPage = createElement('div',{
      elements: [ createText('TODO!!')]
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


}
