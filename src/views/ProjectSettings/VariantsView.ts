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
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'

export class VariantsView  extends UIBaseComponent {

  private stackedPage: UIStackedView;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
    this.stackedPage = new UIStackedView()
                        .setTitle('Build Variants');

    this.mainElement = this.stackedPage.element();

  }

}
