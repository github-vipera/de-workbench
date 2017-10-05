'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createElement, insertElement } from '../../element/index';
import { ProjectManager } from '../../DEWorkbench/ProjectManager';
import { Logger } from '../../logger/Logger';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UINotifications } from '../../ui-components/UINotifications';
import { UIStackedView } from '../../ui-components/UIStackedView';
import { UIInputFormElement, FormType } from '../../ui-components/UIInputFormElement';
import { UICommonsFactory, FormActionType } from '../../ui-components/UICommonsFactory';
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup';
import { PushService, PushPlatform } from '../../services/push/PushService';
const _ = require('lodash');
export class SendPushView extends UIBaseComponent {
    constructor(projectRoot) {
        super();
        this.projectRoot = projectRoot;
        this.pushService = new PushService();
        this.initUI();
    }
    initUI() {
        let form = this.createForm();
        let sectionContainer = createElement('div', {
            elements: [form],
            className: 'section-container'
        });
        let innerPage = createElement('div', {
            elements: [sectionContainer],
            className: 'section'
        });
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
    createForm() {
        let actionButtonsOpt = {
            cancel: {
                caption: 'Clear Data'
            },
            commit: {
                caption: 'Send Push'
            },
            actionListener: (actionType) => {
                if (actionType === FormActionType.Cancel) {
                    this.clearData();
                }
                else if (actionType === FormActionType.Commit) {
                    this.sendPush();
                }
            }
        };
        let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt);
        insertElement(actionButtonsContainer, this.createTargetPlatformSelector());
        let formElements = this.createFormElements();
        let ulEl = createElement('ul', {
            elements: [formElements, actionButtonsContainer],
            className: 'flex-outer'
        });
        let formEl = createElement('form', {
            elements: [ulEl]
        });
        return formEl;
    }
    createFormElements() {
        this.recipentsCrtl = new UIInputFormElement({ caption: 'Recipients', formType: FormType.FlexForm });
        this.alertCrtl = new UIInputFormElement({ caption: 'Alert', formType: FormType.FlexForm });
        this.topicCrtl = new UIInputFormElement({ caption: 'Topic', formType: FormType.FlexForm });
        this.titleCrtl = new UIInputFormElement({ caption: 'Title', formType: FormType.FlexForm });
        this.bodyCrtl = new UIInputFormElement({ caption: 'Body', formType: FormType.FlexForm });
        this.soundCrtl = new UIInputFormElement({ caption: 'Sound', formType: FormType.FlexForm });
        this.badgeCrtl = new UIInputFormElement({ caption: 'Badge', formType: FormType.FlexForm });
        this.categoryCrtl = new UIInputFormElement({ caption: 'Category', formType: FormType.FlexForm });
        this.jsonPayloadCrtl = new UIInputFormElement({ caption: 'JSON Payload', formType: FormType.FlexForm });
        this.iconCrtl = new UIInputFormElement({ caption: 'Icon', formType: FormType.FlexForm });
        return [this.recipentsCrtl.element(),
            this.alertCrtl.element(),
            this.topicCrtl.element(),
            this.titleCrtl.element(),
            this.bodyCrtl.element(),
            this.soundCrtl.element(),
            this.badgeCrtl.element(),
            this.categoryCrtl.element(),
            this.iconCrtl.element(),
            this.jsonPayloadCrtl.element()
        ];
    }
    clearData() {
        Logger.getInstance().debug("Cleaning push tool form");
        this.recipentsCrtl.setValue("");
        this.alertCrtl.setValue("");
        this.topicCrtl.setValue("");
        this.titleCrtl.setValue("");
        this.bodyCrtl.setValue("");
        this.soundCrtl.setValue("");
        this.badgeCrtl.setValue("");
        this.categoryCrtl.setValue("");
        this.jsonPayloadCrtl.setValue("");
        this.iconCrtl.setValue("");
    }
    sendPush() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger.getInstance().debug("Sending push notification...");
            let projectSettings = yield ProjectManager.getInstance().getProjectSettings(this.projectRoot);
            let pushConfig = projectSettings.get('push_tool');
            if (!pushConfig) {
                UINotifications.showError("Invalid push configuration");
                return;
            }
            let platform = this.getSelectedPlatform();
            let pushMessage = this.createPushMessage();
            Logger.getInstance().debug("Sending Push notification to " + platform + "...", JSON.stringify(pushMessage));
            try {
                yield this.pushService.sendPushMessage(pushMessage, platform, pushConfig);
                UINotifications.showInfo("Push notification send successfully");
                Logger.getInstance().info("Push notification send successfully");
            }
            catch (ex) {
                Logger.getInstance().error("Unable to send Push notification: ", ex);
                UINotifications.showError("Unable to send Push notification: " + ex);
            }
            this.storeLastMessageSent(pushMessage);
        });
    }
    createPushMessage() {
        let rs = this.recipentsCrtl.getValue();
        let recipientsList = _.split(rs, ',');
        recipientsList = _.map(recipientsList, _.trim);
        recipientsList = _.filter(recipientsList, function (o) { return o.length > 0; });
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
        };
        return pushMessage;
    }
    getSelectedPlatform() {
        let platformStr = this.targetrPlatformSelector.getSelectedButtons()[0];
        if (platformStr === 'apn') {
            return PushPlatform.APN;
        }
        else {
            return PushPlatform.GCM;
        }
    }
    createTargetPlatformSelector() {
        this.targetrPlatformSelector = new UIButtonGroup(UIButtonGroupMode.Radio);
        this.targetrPlatformSelector.addButton(new UIButtonConfig().setId('apn')
            .setCaption('Apple APN')
            .setSelected(true));
        this.targetrPlatformSelector.addButton(new UIButtonConfig().setId('gcm')
            .setCaption('Google GCM')
            .setSelected(false));
        return this.targetrPlatformSelector.element();
    }
    storeLastMessageSent(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let projectSettings = yield ProjectManager.getInstance().getProjectSettings(this.projectRoot);
            projectSettings.save('push_tool_lastmsg', message);
        });
    }
    getLastMessageSent() {
        return __awaiter(this, void 0, void 0, function* () {
            let projectSettings = yield ProjectManager.getInstance().getProjectSettings(this.projectRoot);
            let ret = projectSettings.get('push_tool_lastmsg');
            return ret;
        });
    }
    loadLastMessageSent() {
        return __awaiter(this, void 0, void 0, function* () {
            let message = yield this.getLastMessageSent();
            if (!message) {
                return null;
            }
            else {
                this.updateUI(message);
            }
        });
    }
    updateUI(message) {
        this.recipentsCrtl.setValue(_.join(message.recipients, ','));
        this.alertCrtl.setValue(message.alert);
        this.topicCrtl.setValue(message.topic);
        this.titleCrtl.setValue(message.title);
        this.bodyCrtl.setValue(message.body);
        this.soundCrtl.setValue(message.sound);
        this.badgeCrtl.setValue(message.badge);
        this.categoryCrtl.setValue(message.category);
        this.jsonPayloadCrtl.setValue(message.payload);
        this.iconCrtl.setValue(message.icon);
    }
}
//# sourceMappingURL=SendPushView.js.map