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
 createTextEditor,
 createControlBlock
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
import { UIInputFormElement, FormType } from '../../ui-components/UIInputFormElement'
import { UICommonsFactory, FormActionsOptions, FormActionType } from '../../ui-components/UICommonsFactory'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'

export class SendPushView extends UIBaseComponent {


    projectRoot:string;
    private stackedPage: UIStackedView;
    private targetrPlatformSelector:UIButtonGroup;

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
      let actionButtonsOpt:FormActionsOptions = {
        cancel : {
          caption : 'Clear Data'
        },
        commit : {
          caption : 'Send Push'
        },
        actionListener: (actionType:number)=>{
          if (actionType===FormActionType.Cancel){
            this.clearData()
          } else if (actionType===FormActionType.Commit){
            this.sendPush()
          }
        }
      }
      let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt)
      insertElement(actionButtonsContainer, this.createTargetPlatformSelector())


      let formElements = this.createFormElements();
      let ulEl = createElement('ul',{
        elements: [ formElements, actionButtonsContainer ],
        className: 'flex-outer'
      })


      let formEl = createElement('form',{
        elements: [ ulEl ]
      })

      return formEl;
    }

    protected createFormElements():Array<HTMLElement>{
      let recipentsCrtl = new UIInputFormElement({ caption: 'Recipients', formType:FormType.FlexForm });
      let alertCrtl = new UIInputFormElement({ caption: 'Alert', formType:FormType.FlexForm  });
      let topicCrtl = new UIInputFormElement({ caption: 'Topic', formType:FormType.FlexForm  });
      let titleCrtl = new UIInputFormElement({ caption: 'Title', formType:FormType.FlexForm  });
      let bodyCrtl = new UIInputFormElement({ caption: 'Body', formType:FormType.FlexForm  });
      let soundCrtl = new UIInputFormElement({ caption: 'Sound', formType:FormType.FlexForm  });
      let badgeCrtl = new UIInputFormElement({ caption: 'Badge', formType:FormType.FlexForm  });
      let categoryCrtl = new UIInputFormElement({ caption: 'Category', formType:FormType.FlexForm  });
      let jsonPayloadCrtl = new UIInputFormElement({ caption: 'JSON Payload', formType:FormType.FlexForm  });

      return [ recipentsCrtl.element(),
               alertCrtl.element(),
               topicCrtl.element(),
               titleCrtl.element(),
               bodyCrtl.element(),
               soundCrtl.element(),
               badgeCrtl.element(),
               categoryCrtl.element(),
               jsonPayloadCrtl.element()
             ]
    }

    protected clearData(){

    }

    protected sendPush(){

    }

    protected createTargetPlatformSelector():HTMLElement{
      // Project Type Radio
      this.targetrPlatformSelector = new UIButtonGroup(UIButtonGroupMode.Radio);
      //let selectorBlock = createControlBlock('project-type','Target Platform',this.targetrPlatformSelector.element());

        this.targetrPlatformSelector.addButton(new UIButtonConfig().setId('android')
                                          .setCaption('Android')
                                          .setSelected(true));

        this.targetrPlatformSelector.addButton(new UIButtonConfig().setId('ios')
                                          .setCaption('iOS')
                                          .setSelected(false));

        return this.targetrPlatformSelector.element();
    }

}
