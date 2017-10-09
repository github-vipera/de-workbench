'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createElement } from '../../element/index';
import { ProjectManager } from '../../DEWorkbench/ProjectManager';
import { Logger } from '../../logger/Logger';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UIInputFormElement } from '../../ui-components/UIInputFormElement';
import { UINotifications } from '../../ui-components/UINotifications';
import { UICommonsFactory, FormActionType } from '../../ui-components/UICommonsFactory';
export class AppInfoView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();
        this.nameCtrl = new UIInputFormElement().setCaption('Name').setPlaceholder('name (appId)').addEventListener('change', (evtCtrl) => {
            this.onTextValueChanged(evtCtrl);
        });
        this.displayName = new UIInputFormElement().setCaption('Display Name').setPlaceholder('display name').addEventListener('change', (evtCtrl) => {
            this.onTextValueChanged(evtCtrl);
        });
        this.descriptionCtrl = new UIInputFormElement().setCaption('Description').setPlaceholder('description').addEventListener('change', (evtCtrl) => {
            this.onTextValueChanged(evtCtrl);
        });
        this.authorCtrl = new UIInputFormElement().setCaption('Author').setPlaceholder('author').addEventListener('change', (evtCtrl) => {
            this.onTextValueChanged(evtCtrl);
        });
        this.licenseCtrl = new UIInputFormElement().setCaption('License').setPlaceholder('license').addEventListener('change', (evtCtrl) => {
            this.onTextValueChanged(evtCtrl);
        });
        this.versionCtrl = new UIInputFormElement().setCaption('Version').setWidth("150px").setPlaceholder('0.0.0').addEventListener('change', (evtCtrl) => {
            this.onTextValueChanged(evtCtrl);
        });
        let actionButtonsOpt = {
            cancel: {
                caption: 'Revert Changes'
            },
            commit: {
                caption: 'Save Changes'
            },
            actionListener: (actionType) => {
                if (actionType === FormActionType.Cancel) {
                    this.reload();
                }
                else if (actionType === FormActionType.Commit) {
                    this.saveChanges();
                }
            }
        };
        let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt);
        this.mainFormElement = createElement('form', {
            elements: [
                this.nameCtrl.element(),
                this.displayName.element(),
                this.descriptionCtrl.element(),
                this.authorCtrl.element(),
                this.licenseCtrl.element(),
                this.versionCtrl.element(),
                actionButtonsContainer
            ],
            className: 'de-workbench-appinfo-form general-info-form'
        });
        this.mainFormElement.setAttribute("tabindex", "-1");
        this.mainElement = this.mainFormElement;
        this.reload();
    }
    reload() {
        return __awaiter(this, void 0, void 0, function* () {
            ProjectManager.getInstance().cordova.getProjectInfo(this.currentProjectPath, false).then((ret) => {
                if (ret == null) {
                    return;
                }
                this.nameCtrl.setValue(ret.name);
                this.displayName.setValue(ret.displayName);
                this.descriptionCtrl.setValue(ret.description);
                this.authorCtrl.setValue(ret.author);
                this.licenseCtrl.setValue(ret.license);
                this.versionCtrl.setValue(ret.version);
            });
        });
    }
    saveChanges() {
        return __awaiter(this, void 0, void 0, function* () {
            var currentPackageJson = yield ProjectManager.getInstance().cordova.getPackageJson(this.currentProjectPath);
            currentPackageJson.name = this.nameCtrl.getValue();
            currentPackageJson.displayName = this.displayName.getValue();
            currentPackageJson.description = this.descriptionCtrl.getValue();
            currentPackageJson.author = this.authorCtrl.getValue();
            currentPackageJson.license = this.licenseCtrl.getValue();
            currentPackageJson.version = this.versionCtrl.getValue();
            yield ProjectManager.getInstance().cordova.storePackageJson(this.currentProjectPath, currentPackageJson);
            UINotifications.showInfo("Project information changes saved successfully.");
        });
    }
    onTextValueChanged(sourceCtrl) {
        Logger.consoleLog("Changed value: ", sourceCtrl.getValue());
    }
}
//# sourceMappingURL=AppInfoView.js.map