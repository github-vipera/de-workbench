'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement } from '../../element/index';
import { ProjectManager } from '../../DEWorkbench/ProjectManager';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UINotifications } from '../../ui-components/UINotifications';
import { UIStackedView } from '../../ui-components/UIStackedView';
import { UIInputFormElement, UIInputBrowseForFileFormElement, FormType } from '../../ui-components/UIInputFormElement';
import { UICommonsFactory, FormActionType } from '../../ui-components/UICommonsFactory';
export class PushSettingsView extends UIBaseComponent {
    constructor(projectRoot) {
        super();
        this.projectRoot = projectRoot;
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
            titleIconClass: 'icon-gear',
            subtle: 'This tool allows you to send notifications to a device list'
        })
            .setTitle('Push Settings')
            .setInnerView(innerPage)
            .addHeaderClassName('de-workbench-stacked-view-header-section-thin');
        this.mainElement = this.stackedPage.element();
        this.reloadConfig();
    }
    createForm() {
        let actionButtonsOpt = {
            cancel: {
                caption: 'Revert Changes'
            },
            commit: {
                caption: 'Save Changes'
            },
            actionListener: (actionType) => {
                if (actionType === FormActionType.Cancel) {
                    this.revertConfig();
                }
                else if (actionType === FormActionType.Commit) {
                    this.saveConfig();
                }
            }
        };
        let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt);
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
        let apnSectionTitle = UICommonsFactory.createFormSectionTitle('Apple APN');
        this.iosPemCertPathCrtl = new UIInputBrowseForFileFormElement({ caption: 'PEM Cert. Path', placeholder: 'Enter .pem certificate path here', formType: FormType.FlexForm });
        this.iosPemKeyPathCrtl = new UIInputBrowseForFileFormElement({ caption: 'PEM Key. Path', placeholder: 'Enter .pem key path here', formType: FormType.FlexForm });
        this.iosPassphraseCrtl = new UIInputFormElement({ caption: 'Passphrase', placeholder: 'Enter passphrase here', password: true, formType: FormType.FlexForm });
        let divider = UICommonsFactory.createFormSeparator();
        let gcmSectionTitle = UICommonsFactory.createFormSectionTitle('Google GCM');
        this.gcmApiKeyCrtl = new UIInputFormElement({ caption: 'API Key', placeholder: 'Enter GCM API key here', formType: FormType.FlexForm });
        return [apnSectionTitle,
            this.iosPemCertPathCrtl.element(),
            this.iosPemKeyPathCrtl.element(),
            this.iosPassphraseCrtl.element(),
            divider,
            gcmSectionTitle,
            this.gcmApiKeyCrtl.element()
        ];
    }
    reloadConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let projectSettings = yield ProjectManager.getInstance().getProjectSettings(this.projectRoot);
            console.log("reloadConfig ", projectSettings);
            let pushConfig = projectSettings.get('push_tool');
            if (!pushConfig) {
                return;
            }
            if (pushConfig.apn && pushConfig.apn.cert) {
                this.iosPemCertPathCrtl.setValue(pushConfig.apn.cert);
            }
            if (pushConfig.apn && pushConfig.apn.key) {
                this.iosPemKeyPathCrtl.setValue(pushConfig.apn.key);
            }
            if (pushConfig.apn && pushConfig.apn.passphrase) {
                this.iosPassphraseCrtl.setValue(pushConfig.apn.passphrase);
            }
            if (pushConfig.gcm && pushConfig.gcm.apikey) {
                this.gcmApiKeyCrtl.setValue(pushConfig.gcm.apikey);
            }
        });
    }
    revertConfig() {
        this.reloadConfig();
    }
    saveConfig() {
        return __awaiter(this, void 0, void 0, function* () {
            let projectSettings = yield ProjectManager.getInstance().getProjectSettings(this.projectRoot);
            let pushConfig = {
                'apn': {
                    'cert': this.iosPemCertPathCrtl.getValue(),
                    'key': this.iosPemKeyPathCrtl.getValue(),
                    'passphrase': this.iosPassphraseCrtl.getValue(),
                    'production': false
                },
                'gcm': {
                    'apikey': this.gcmApiKeyCrtl.getValue()
                }
            };
            projectSettings.save('push_tool', pushConfig);
            UINotifications.showInfo("Push configuration saved successfully.");
        });
    }
}
//# sourceMappingURL=PushSettingsView.js.map