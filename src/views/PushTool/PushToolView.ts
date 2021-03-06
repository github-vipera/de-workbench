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

export class PushToolView extends UIPane {

  private tabbedView: UITabbedView;
  private sendPushView:SendPushView;
  private pushSettingsView:PushSettingsView;

  constructor(uri:string){
    super(uri, "Push Tool")
  }

  protected createUI():HTMLElement {
    Logger.getInstance().debug("PushToolsView creating for ",this.paneId);
    this.sendPushView = new SendPushView(this.options.userData.projectRoot)
    this.pushSettingsView = new PushSettingsView(this.options.userData.projectRoot)

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
