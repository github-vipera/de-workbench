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

export class ServersView extends UIPane {

  constructor(projectRoot:string){
    super({
      title: "DE Servers",
      projectRoot: projectRoot,
      paneName : "DEServers",
      location : 'right'
    })

    Logger.getInstance().debug("PushToolView creating for ",this.projectRoot, this.projectId);

  }

  protected createUI():HTMLElement {

    let el = createElement('div', {
        elements: [
          createText("Servers View")
        ],
        className: 'de-workbench-servers-view'
    });
    return el;
  }


  public destroy(){
    super.destroy();
  }

}
