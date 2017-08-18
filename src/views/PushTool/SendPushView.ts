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

import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Logger } from '../../logger/Logger'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UINotifications } from '../../ui-components/UINotifications'
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UIInputFormElement, FormType } from '../../ui-components/UIInputFormElement'
import { UICommonsFactory, FormActionsOptions, FormActionType } from '../../ui-components/UICommonsFactory'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'
import { PushService, PushPlatform, PushServiceOptions } from '../../services/push/PushService'
import { PushSender, PushMessage } from '../../services/push/PushSender'

const _ = require ('lodash')

export class SendPushView extends UIBaseComponent {


    projectRoot:string;
    private stackedPage: UIStackedView;
    private targetrPlatformSelector:UIButtonGroup;
    private pushService:PushService;

    private recipentsCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Recipients', formType:FormType.FlexForm });
    private alertCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Alert', formType:FormType.FlexForm  });
    private topicCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Topic', formType:FormType.FlexForm  });
    private titleCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Title', formType:FormType.FlexForm  });
    private bodyCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Body', formType:FormType.FlexForm  });
    private soundCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Sound', formType:FormType.FlexForm  });
    private badgeCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Badge', formType:FormType.FlexForm  });
    private categoryCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'Category', formType:FormType.FlexForm  });
    private jsonPayloadCrtl:UIInputFormElement;// = new UIInputFormElement({ caption: 'JSON Payload', formType:FormType.FlexForm  });
    private iconCrtl:UIInputFormElement;

    constructor(projectRoot:string){
      super();
      this.projectRoot = projectRoot;
      this.pushService = new PushService();
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

      this.loadLastMessageSent();

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
      this.recipentsCrtl = new UIInputFormElement({ caption: 'Recipients', formType:FormType.FlexForm });
      this.alertCrtl = new UIInputFormElement({ caption: 'Alert', formType:FormType.FlexForm  });
      this.topicCrtl = new UIInputFormElement({ caption: 'Topic', formType:FormType.FlexForm  });
      this.titleCrtl = new UIInputFormElement({ caption: 'Title', formType:FormType.FlexForm  });
      this.bodyCrtl = new UIInputFormElement({ caption: 'Body', formType:FormType.FlexForm  });
      this.soundCrtl = new UIInputFormElement({ caption: 'Sound', formType:FormType.FlexForm  });
      this.badgeCrtl = new UIInputFormElement({ caption: 'Badge', formType:FormType.FlexForm  });
      this.categoryCrtl = new UIInputFormElement({ caption: 'Category', formType:FormType.FlexForm  });
      this.jsonPayloadCrtl = new UIInputFormElement({ caption: 'JSON Payload', formType:FormType.FlexForm  });
      this.iconCrtl =  new UIInputFormElement({ caption: 'Icon', formType:FormType.FlexForm  });

      return [ this.recipentsCrtl.element(),
               this.alertCrtl.element(),
               this.topicCrtl.element(),
               this.titleCrtl.element(),
               this.bodyCrtl.element(),
               this.soundCrtl.element(),
               this.badgeCrtl.element(),
               this.categoryCrtl.element(),
               this.iconCrtl.element(),
               this.jsonPayloadCrtl.element()
             ]
    }

    protected clearData(){
      this.recipentsCrtl.setValue("")
      this.alertCrtl.setValue("")
      this.topicCrtl.setValue("")
      this.titleCrtl.setValue("")
      this.bodyCrtl.setValue("")
      this.soundCrtl.setValue("")
      this.badgeCrtl.setValue("")
      this.categoryCrtl.setValue("")
      this.jsonPayloadCrtl.setValue("")
      this.iconCrtl.setValue("")
    }

    protected async sendPush(){
      let projectSettings = await ProjectManager.getInstance().getProjectSettings(this.projectRoot);
      let pushConfig = projectSettings.get('push_tool')
      if (!pushConfig){
        UINotifications.showError("Invalid push configuration")
        return; //invalid configuration
      }
      let platform = this.getSelectedPlatform();
      let pushMessage:PushMessage= this.createPushMessage();
      try {
        await this.pushService.sendPushMessage(pushMessage, platform, pushConfig)
        UINotifications.showInfo("Push notification send successfully")
      } catch (ex){
        UINotifications.showError(ex)
      }
      this.storeLastMessageSent(pushMessage);
    }

    protected createPushMessage():PushMessage {
      let rs = this.recipentsCrtl.getValue();
      let recipientsList:Array<string> = _.split(rs, ',');
      recipientsList = _.map(recipientsList, _.trim);
      recipientsList = _.filter(recipientsList, function(o) { return o.length>0; });
      let pushMessage = {
        alert: this.alertCrtl.getValue(),
        badge: this.badgeCrtl.getValue(),
        sound: this.soundCrtl.getValue(),
        title: this.titleCrtl.getValue(),
        body: this.bodyCrtl.getValue(),
        topic: this.topicCrtl.getValue(),
        category: this.categoryCrtl.getValue(),
        payload: this.jsonPayloadCrtl.getValue(),
        icon: this.iconCrtl.getValue(),
        recipients: recipientsList
      }
      return pushMessage;
    }

    protected getSelectedPlatform():PushPlatform {
      let platformStr = this.targetrPlatformSelector.getSelectedButtons() [0]
      if (platformStr==='apn'){
        return PushPlatform.APN;
      } else {
        return PushPlatform.GCM;
      }
    }

    protected createTargetPlatformSelector():HTMLElement{
      // Project Type Radio
      this.targetrPlatformSelector = new UIButtonGroup(UIButtonGroupMode.Radio);

        this.targetrPlatformSelector.addButton(new UIButtonConfig().setId('apn')
                                          .setCaption('Apple APN')
                                          .setSelected(true));

        this.targetrPlatformSelector.addButton(new UIButtonConfig().setId('gcm')
                                          .setCaption('Google GCM')
                                          .setSelected(false));

        return this.targetrPlatformSelector.element();
    }

    protected async storeLastMessageSent(message:PushMessage) {
      let projectSettings = await ProjectManager.getInstance().getProjectSettings(this.projectRoot);
      projectSettings.save('push_tool_lastmsg', message)
    }

    protected async getLastMessageSent():Promise<PushMessage>{
      let projectSettings = await ProjectManager.getInstance().getProjectSettings(this.projectRoot);
      let ret = projectSettings.get('push_tool_lastmsg')
      return ret;
    }

    protected async loadLastMessageSent():Promise<any>{
      let message = await this.getLastMessageSent();
      if (!message){
        return null;
      } else {
        this.updateUI(message);
      }
    }

    protected updateUI(message:PushMessage){
      this.recipentsCrtl.setValue(_.join(message.recipients, ','))
      this.alertCrtl.setValue(message.alert)
      this.topicCrtl.setValue(message.topic)
      this.titleCrtl.setValue(message.title)
      this.bodyCrtl.setValue(message.body)
      this.soundCrtl.setValue(message.sound)
      this.badgeCrtl.setValue(message.badge)
      this.categoryCrtl.setValue(message.category)
      this.jsonPayloadCrtl.setValue(message.payload)
      this.iconCrtl.setValue(message.icon)
    }

}
