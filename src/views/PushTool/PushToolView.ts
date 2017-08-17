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
import { UIPane } from '../../ui-components/UIPane'
import { UIListView, UIListViewModel } from '../../ui-components/UIListView'
import { Logger } from '../../logger/Logger'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { SendPushView } from './SendPushView'
import { PushSettingsView } from './PushSettingsView'

const crypto = require('crypto');

export class PushToolView extends UIPane {

  private tabbedView: UITabbedView;
  private sendPushView:SendPushView;
  private pushSettingsView:PushSettingsView;

  constructor(projectRoot:string){
    super({
      title: "Push Tool",
      projectRoot: projectRoot,
      paneName : "PushTool"
    })

    Logger.getInstance().debug("PushToolsView creating for ",this.projectRoot, this.projectId);

  }

  protected createUI():HTMLElement {
    this.sendPushView = new SendPushView(this.projectRoot)
    this.pushSettingsView = new PushSettingsView(this.projectRoot)

    this.tabbedView = new UITabbedView();//.setTabType(UITabbedViewTabType.Horizontal);
    this.tabbedView.addView(new UITabbedViewItem('sendPush',           'Send Push',              this.sendPushView.element()).setTitleClass('icon icon-comment'));
    this.tabbedView.addView(new UITabbedViewItem('pushSettings',       'Push Settings',          this.pushSettingsView.element()).setTitleClass('icon icon-gear'));

    let el = createElement('div', {
        elements: [
          this.tabbedView.element()
        ],
        className: 'de-workbench-project-settings-view'
    });
    return el;
  }


  public destroy(){
    this.sendPushView.destroy();
    this.pushSettingsView.destroy();
    this.tabbedView.destroy();
    super.destroy();
  }


}
