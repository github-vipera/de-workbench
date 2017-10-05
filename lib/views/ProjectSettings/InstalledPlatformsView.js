'use babel';
import { createText, createElement, createIcon } from '../../element/index';
import { EventEmitter } from 'events';
import { ProjectManager } from '../../DEWorkbench/ProjectManager';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UIListView } from '../../ui-components/UIListView';
import * as _ from 'lodash';
import { UIButtonMenu } from '../../ui-components/UIButtonMenu';
import { UINotifications } from '../../ui-components/UINotifications';
import { UILineLoader } from '../../ui-components/UILineLoader';
export class InstalledPlatformsView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.lineLoader = new UILineLoader();
        this.currentProjectPath = ProjectManager.getInstance().getCurrentProjectPath();
        this.installedPlatformListModel = new InstalledPlatformListModel(this.currentProjectPath)
            .setActionListener(this.doAction.bind(this));
        this.installedPlatformList = new UIListView(this.installedPlatformListModel);
        var listCtrl = this.createListControlBlock("", this.installedPlatformList, this.lineLoader);
        this.btnInstallNewPlatform = new UIButtonMenu()
            .setCaption('Install New Platform...')
            .setInfoMessage('Select a new Platform to install')
            .setEmptyMessage('  NOTE: No other platforms are available to install')
            .setOnSelectionListener((menuItem) => {
            const selected = atom.confirm({
                message: 'Install New Platform',
                detailedMessage: 'Do you want to confirm the ' + menuItem.displayName + ' platform installation ?',
                buttons: ['Yes, Install it', 'Cancel']
            });
            if (selected == 0) {
                this.doInstallPlatform(menuItem.value);
            }
        });
        let installNewPatformCtrl = createElement('div', {
            elements: [
                this.btnInstallNewPlatform.element()
            ],
            className: 'install-platform-ctrl'
        });
        this.mainFormElement = createElement('form', {
            elements: [
                listCtrl,
                installNewPatformCtrl
            ],
            className: 'de-workbench-appinfo-form installed-platforms-form'
        });
        this.mainFormElement.setAttribute("tabindex", "-1");
        this.mainElement = this.mainFormElement;
        this.reload();
    }
    doAction(platformInfo, action) {
        if (action === 0) {
            const selected = atom.confirm({
                message: 'Uninstall Platform',
                detailedMessage: "Are you sure you want to uninstall the " + PlatformUtils.toPlatformDisplayName(platformInfo.name) + " platform ?",
                buttons: ['Yes, Remove It', 'Cancel']
            });
            if (selected == 0) {
                this.doUninstallPlatform(platformInfo.name);
            }
        }
    }
    doUninstallPlatform(platformName) {
        this.lineLoader.setOnLoading(true);
        ProjectManager.getInstance().cordova.removePlatform(this.currentProjectPath, platformName).then(() => {
            UINotifications.showInfo("Platform " + PlatformUtils.toPlatformDisplayName(platformName) + " uninstalled successfully.");
            this.reload();
            this.lineLoader.setOnLoading(false);
        }).catch((err) => {
            UINotifications.showError("Error unistalling Platform " + PlatformUtils.toPlatformDisplayName(platformName) + ". See the logs for more details.");
            this.lineLoader.setOnLoading(false);
        });
    }
    doInstallPlatform(platformName) {
        this.lineLoader.setOnLoading(true);
        ProjectManager.getInstance().cordova.addPlatform(this.currentProjectPath, platformName).then(() => {
            UINotifications.showInfo("Platform " + PlatformUtils.toPlatformDisplayName(platformName) + " installed successfully.");
            this.reload();
            this.lineLoader.setOnLoading(false);
        }).catch((err) => {
            UINotifications.showError("Error adding Platform " + PlatformUtils.toPlatformDisplayName(platformName) + ". See the logs for more details.");
            this.lineLoader.setOnLoading(false);
        });
    }
    updateAvailableToInstallPlatforms() {
        var platforms = this.installedPlatformListModel.getCurrentPlatforms();
        var availableToInstall = [{ value: 'ios', displayName: 'iOS' },
            { value: 'android', displayName: 'Android' },
            { value: 'browser', displayName: 'Browser' }];
        for (var i = 0; i < platforms.length; i++) {
            _.remove(availableToInstall, {
                value: platforms[i].name
            });
        }
        this.btnInstallNewPlatform.setMenuItems(availableToInstall);
    }
    reload() {
        this.lineLoader.setOnLoading(true);
        this.installedPlatformListModel.reload(() => {
            this.updateAvailableToInstallPlatforms();
            this.lineLoader.setOnLoading(false);
        });
    }
    createListControlBlock(caption, control, loader) {
        var label = createElement('label', {
            elements: [
                createText(caption)
            ]
        });
        var blockElement = createElement('div', {
            elements: [
                label,
                control.element(),
                loader.element()
            ],
            className: 'block control-group'
        });
        return blockElement;
    }
}
class InstalledPlatformListModel {
    constructor(projectPath) {
        this.events = new EventEmitter();
        this.projectPath = projectPath;
    }
    hasHeader() {
        return false;
    }
    getRowCount() {
        if (this.platforms) {
            return this.platforms.length;
        }
        else {
            return 0;
        }
    }
    getColCount() {
        return 1;
    }
    getElementAt(row, col) {
        return this.getRenderer(row).element();
    }
    getValueAt(row, col) {
        return this.platforms[row].name;
    }
    getClassNameAt(row, col) {
        return "";
    }
    getColumnName(col) {
        return "";
    }
    getClassName() {
        return "installed-platform-list";
    }
    setActionListener(actionListener) {
        this.actionListener = actionListener;
        return this;
    }
    getRenderer(row) {
        if (this.platformElements["" + row]) {
            return this.platformElements["" + row];
        }
        else {
            var renderer = this.createRenderer(row);
            this.platformElements["" + row] = renderer;
            return renderer;
        }
    }
    createRenderer(row) {
        var platformInfo = this.platforms[row];
        var ret = new PlatformRenderer(platformInfo, this.onItemAction.bind(this));
        return ret;
    }
    reload(didDone) {
        ProjectManager.getInstance().cordova.getInstalledPlatforms(this.projectPath).then((ret) => {
            this.platforms = ret;
            this.platformElements = {};
            this.fireModelChanged();
            didDone();
        });
    }
    getCurrentPlatforms() {
        return this.platforms;
    }
    onItemAction(platformInfo, action) {
        if (this.actionListener) {
            this.actionListener(platformInfo, action);
        }
    }
    fireModelChanged() {
        this.events.emit('didModelChanged');
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        this.events.removeAllListeners();
        Object.keys(this.platformElements).forEach((key) => {
            let renderer = this.platformElements[key];
            renderer.destroy();
        });
        this.platforms = null;
        this.platformElements = null;
        this.events = null;
    }
}
class PlatformRenderer extends UIBaseComponent {
    constructor(platformInfo, itemActionListener) {
        super();
        this.itemActionListener = itemActionListener;
        this.platformInfo = platformInfo;
        this.buildUI();
    }
    buildUI() {
        var iconDiv = createIcon(this.platformInfo.name);
        iconDiv.classList.add("platform-icon");
        var platformNameDiv = createElement('div', {
            elements: [
                createText(PlatformUtils.toPlatformDisplayName(this.platformInfo.name))
            ],
            className: 'platform-name'
        });
        var platformVersionDiv = createElement('div', {
            elements: [
                createText(this.platformInfo.version)
            ],
            className: 'platform-version'
        });
        let btnManualInstall = createElement('button', {
            elements: [
                createText("Remove")
            ],
            className: 'btn inline-block-tigh btn-uninstall-platform'
        });
        btnManualInstall.addEventListener('click', (evt) => {
            if (this.itemActionListener) {
                this.itemActionListener(this.platformInfo, 0);
            }
        });
        this.mainElement = createElement('div', {
            elements: [
                iconDiv,
                platformNameDiv,
                platformVersionDiv,
                btnManualInstall
            ],
            className: 'platform-renderer'
        });
    }
    destroy() {
        super.destroy();
    }
}
class PlatformUtils {
    static toPlatformDisplayName(platformName) {
        if (platformName === 'ios') {
            return "iOS";
        }
        else if (platformName === 'android') {
            return "Android";
        }
        else if (platformName === 'browser') {
            return "Browser";
        }
    }
}
//# sourceMappingURL=InstalledPlatformsView.js.map