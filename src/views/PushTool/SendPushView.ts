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
import { UIInputFormElement,UIInputFlexFormElement } from '../../ui-components/UIInputFormElement'

export class SendPushView extends UIBaseComponent {

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
                            titleIconClass: 'icon-comment',
                            subtle: 'This tool allows you to send notifications to a device list'
                          })
                          .setTitle('Send Push')
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
      let recipentsCrtl = new UIInputFlexFormElement({ caption: 'Recipients' });
      let alertCrtl = new UIInputFlexFormElement({ caption: 'Alert' });
      let topicCrtl = new UIInputFlexFormElement({ caption: 'Topic' });
      let titleCrtl = new UIInputFlexFormElement({ caption: 'Title' });
      let bodyCrtl = new UIInputFlexFormElement({ caption: 'Body' });

      return [ recipentsCrtl.element(),
               alertCrtl.element(),
               topicCrtl.element(),
               titleCrtl.element(),
               bodyCrtl.element()
             ]
    }

}
