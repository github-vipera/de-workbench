'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createText, createElement, insertElement } from '../../../element/index';
import { EventEmitter } from 'events';
import { ProjectManager } from '../../../DEWorkbench/ProjectManager';
import { Logger } from '../../../logger/Logger';
import { UIStackedView } from '../../../ui-components/UIStackedView';
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { UICollapsiblePane } from '../../../ui-components/UICollapsiblePane';
import { AppType } from './AbstractAppSignatureEditorCtrl';
import { IOSAppSignatureEditorCtrl } from './IOSAppSignatureEditorCtrl';
import { AndroidAppSignatureEditorCtrl } from './AndroidAppSignatureEditorCtrl';
import { UICommonsFactory, FormActionType } from '../../../ui-components/UICommonsFactory';
import { IOSUtilities } from '../../../cordova/IOSUtilities';
const path = require('path');
const fs = require("fs");
export class AppSignatureView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();
        this.iosEditor = new class extends SignaturePlatformEditorCtrl {
            createEditorCtrl(appType) {
                return new IOSAppSignatureEditorCtrl(appType);
            }
            createExtendedActions() {
                let reloadButton = createElement('button', {
                    elements: [createText('Reload Provisioning Profiles')],
                    className: 'btn icon icon-repo-sync'
                });
                reloadButton.addEventListener('click', () => {
                    this.reloadProvisioningProfiles();
                });
                return reloadButton;
            }
            reloadProvisioningProfiles() {
                return __awaiter(this, void 0, void 0, function* () {
                    let provFiles = yield IOSUtilities.loadProvisioningProfiles();
                    let ctrl = this.debugEditCtrl;
                    ctrl.reloadProvisioningProfiles(provFiles);
                    ctrl = this.releaseEditCtrl;
                    ctrl.reloadProvisioningProfiles(provFiles);
                });
            }
            prepareForEdit() {
                super.prepareForEdit();
                this.reloadProvisioningProfiles();
            }
        }().addEventListener('didChanged', (editorCtrl) => {
            this.writeBuildJson(editorCtrl.getBuildJson());
        });
        this.androidEditor = new class extends SignaturePlatformEditorCtrl {
            createEditorCtrl(appType) {
                return new AndroidAppSignatureEditorCtrl(appType);
            }
        }().addEventListener('didChanged', (editorCtrl) => {
            this.writeBuildJson(editorCtrl.getBuildJson());
        });
        this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
        this.tabbedView.addView(new UITabbedViewItem('ios', 'iOS', this.iosEditor.element()));
        this.tabbedView.addView(new UITabbedViewItem('android', 'Android', this.androidEditor.element()));
        this.stackedPage = new UIStackedView({
            titleIconClass: 'icon-shield'
        })
            .setTitle('App Signature')
            .setInnerView(this.tabbedView.element())
            .addHeaderClassName('de-workbench-stacked-view-header-section-thin');
        this.mainElement = this.stackedPage.element();
        this.reload();
    }
    updateUI(buildJson) {
        this.iosEditor.updateUI(buildJson);
        this.androidEditor.updateUI(buildJson);
    }
    reload() {
        this.buildJson = this.reloadBuildJson();
        this.updateUI(this.buildJson);
    }
    getBuildJsonPath() {
        return path.join(this.currentProjectPath, "build.json");
    }
    defaultBuildJson() {
        return {
            "ios": {
                "debug": {},
                "release": {}
            },
            "android": {
                "debug": {},
                "release": {}
            }
        };
    }
    reloadBuildJson() {
        let buildJsonPath = this.getBuildJsonPath();
        var exists = fs.existsSync(buildJsonPath);
        if (!exists) {
            let buildJson = this.defaultBuildJson();
            this.writeBuildJson(buildJson);
            return buildJson;
        }
        else {
            return JSON.parse(fs.readFileSync(buildJsonPath, 'utf8'));
        }
    }
    writeBuildJson(buildJson) {
        if (!buildJson) {
            buildJson = this.buildJson;
        }
        var string = JSON.stringify(buildJson, null, '\t');
        fs.writeFile(this.getBuildJsonPath(), string, function (err) {
            if (err)
                return console.error(err);
            Logger.consoleLog('done');
        });
    }
    destroy() {
        this.tabbedView.destroy();
        this.stackedPage.destroy();
        this.iosEditor.destroy();
        this.androidEditor.destroy();
        super.destroy();
    }
}
class SignaturePlatformEditorCtrl extends UIBaseComponent {
    constructor() {
        super();
        this.events = new EventEmitter();
        this.initUI();
        this.prepareForEdit();
    }
    initUI() {
        this.debugEditCtrl = this.createEditorCtrl(AppType.Debug);
        this.releaseEditCtrl = this.createEditorCtrl(AppType.Release);
        this.collapsiblePane = new UICollapsiblePane();
        this.collapsiblePane.addItem({
            collapsed: false,
            id: 'debug',
            caption: "Debug",
            subtle: "",
            view: this.debugEditCtrl.element()
        })
            .addItem({
            collapsed: false,
            id: 'release',
            caption: "Release",
            view: this.releaseEditCtrl.element()
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
        let extendedActions = this.createExtendedActions();
        if (extendedActions) {
            insertElement(actionButtonsContainer, extendedActions);
        }
        let container = createElement('div', {
            elements: [this.collapsiblePane.element(), actionButtonsContainer],
            className: 'de-workbench-appsignature-control-container'
        });
        this.mainElement = container;
    }
    prepareForEdit() { }
    createExtendedActions() {
        return null;
    }
    reload() {
        this.debugEditCtrl.reload();
        this.releaseEditCtrl.reload();
    }
    saveChanges() {
        this.debugEditCtrl.saveChanges();
        this.releaseEditCtrl.saveChanges();
        this.events.emit('didChanged', this);
    }
    createEditorCtrl(appType) {
        return null;
    }
    destroy() {
        this.events.removeAllListeners();
        this.debugEditCtrl.destroy();
        this.releaseEditCtrl.destroy();
        this.events = null;
        super.destroy();
    }
    updateUI(buildJson) {
        this.buildJson = buildJson;
        this.debugEditCtrl.setBuildJson(buildJson);
        this.releaseEditCtrl.setBuildJson(buildJson);
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    getBuildJson() {
        return this.buildJson;
    }
}
//# sourceMappingURL=AppSignatureView.js.map