'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createText, createElement, insertElement, createInput } from '../../element/index';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UIInputFormElement } from '../../ui-components/UIInputFormElement';
import { VariantsManager } from '../../DEWorkbench/VariantsManager';
import { CordovaDeviceManager } from '../../cordova/CordovaDeviceManager';
import { UISelect } from '../../ui-components/UISelect';
import { UILineLoader } from '../../ui-components/UILineLoader';
import { map, forEach } from 'lodash';
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView';
import { TaskViewEnvironmentTab } from './TaskViewEnvironmentTab';
import { Logger } from '../../logger/Logger';
const NONE_PLACEHOLDER = '-- None --';
export class TaskViewContentPanel extends UIBaseComponent {
    constructor(evtEmitter) {
        super();
        this.deviceRequestId = 0;
        this.evtEmitter = evtEmitter;
        this.initUI();
    }
    initUI() {
        this.mainElement = createElement('atom-panel', {
            className: 'de-workbench-taskpanel-content',
            elements: []
        });
        this.initTabView();
        this.initGeneralTabUI();
        this.initEnvironmentTabUI();
        this.setAllTabsVisibility(false);
    }
    initTabView() {
        this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
        insertElement(this.mainElement, this.tabbedView.element());
    }
    initGeneralTabUI() {
        let panelContainer = createElement('div', {
            className: 'de-workbench-taskpanel-content-container',
            elements: []
        });
        panelContainer.classList.add('form-container');
        this.createTaskNameEl(panelContainer);
        this.createPlatformSelect(panelContainer);
        this.createDeviceSelect(panelContainer);
        this.createReleaseCheckbox(panelContainer);
        this.createVariantSelect(panelContainer);
        this.createNodeTaskSelect(panelContainer);
        this.tabbedView.addView(new UITabbedViewItem('GeneralPanel', "General", panelContainer));
    }
    initEnvironmentTabUI() {
        this.taskViewEnvironmentTab = new TaskViewEnvironmentTab();
        let panelContainer = createElement('div', {
            className: 'de-workbench-taskpanel-content-container',
            elements: [
                this.taskViewEnvironmentTab.element()
            ]
        });
        this.tabbedView.addView(new UITabbedViewItem('EnvironmentPanel', "Environment", panelContainer));
    }
    createTaskNameEl(panelContainer) {
        this.taskNameEl = new UIInputFormElement().setCaption('Task name').setPlaceholder('Your task name').addEventListener('change', (evtCtrl) => {
            if (this.taskConfig) {
                this.taskConfig.name = this.taskNameEl.getValue();
                this.evtEmitter.emit('didChangeName', this.taskConfig.name);
            }
        });
        insertElement(panelContainer, this.taskNameEl.element());
    }
    createPlatformSelect(panelContainer) {
        this.platformSelect = new UISelect();
        this.platformSelectListener = {
            onItemSelected: () => {
                this.updateDevices(this.getSelectedPlatform());
            }
        };
        this.platformSelect.addSelectListener(this.platformSelectListener);
        let row = this.createFormRow(createText('Platform'), this.platformSelect.element(), 'platforms');
        insertElement(panelContainer, row);
    }
    createVariantSelect(panelContainer) {
        this.variantsLineLoader = new UILineLoader();
        this.variantSelect = new UISelect();
        let wrapper = createElement('div', {
            className: 'line-loader-wrapper',
            elements: [
                this.variantSelect.element(),
                this.variantsLineLoader.element()
            ]
        });
        let row = this.createFormRow(createText('Variant'), wrapper, 'variants');
        insertElement(panelContainer, row);
    }
    createNodeTaskSelect(panelContainer) {
        this.npmScriptsSelect = new UISelect();
        let row = this.createFormRow(createText('Npm scripts (before task)'), this.npmScriptsSelect.element(), 'npmScript');
        insertElement(panelContainer, row);
    }
    createDeviceSelect(panelContainer) {
        this.deviceSelect = new UISelect();
        this.deviceLineLoader = new UILineLoader();
        let wrapper = createElement('div', {
            className: 'line-loader-wrapper',
            elements: [
                this.deviceSelect.element(),
                this.deviceLineLoader.element()
            ]
        });
        let row = this.createFormRow(createText('Device / Emulator'), wrapper, 'devices');
        insertElement(panelContainer, row);
    }
    createReleaseCheckbox(panelContainer) {
        this.isReleaseEl = createInput({
            type: 'checkbox'
        });
        this.isReleaseEl.classList.remove('form-control');
        this.isReleaseEl.setAttribute('name', 'release');
        let label = createElement('label', {
            className: "label-for"
        });
        label.innerText = 'Release';
        label.setAttribute('for', 'release');
        let row = this.createFormRow(label, this.isReleaseEl, 'isRelease');
        insertElement(panelContainer, row);
    }
    updateTaskName() {
        this.taskNameEl.setValue(this.taskConfig.name);
    }
    updatePlatforms(selected) {
        let platforms = this.projectInfo ? this.projectInfo.platforms : [];
        let model = map(platforms, (single) => {
            return {
                value: single.name,
                name: single.name
            };
        });
        this.platformSelect.setItems(model);
        if (selected) {
            this.platformSelect.setSelectedItem(selected.name);
        }
    }
    updateNodeScripts(def) {
        let npmScripts = this.projectInfo ? this.projectInfo.npmScripts : [];
        let model = map(npmScripts, (value, key) => {
            return {
                name: key,
                value: key
            };
        });
        model.unshift({
            name: NONE_PLACEHOLDER,
            value: ''
        });
        this.npmScriptsSelect.setItems(model);
        if (def) {
            this.npmScriptsSelect.resetSelection();
            this.npmScriptsSelect.setSelectedItem(def);
        }
    }
    generateNewDeviceRid() {
        return (this.deviceRequestId = this.deviceRequestId + 1);
    }
    isOldDeviceRequest(rid) {
        return rid < this.deviceRequestId;
    }
    updateDevices(platform, def) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.deviceManager || !platform) {
                return Promise.resolve([]);
            }
            let rid = this.generateNewDeviceRid();
            this.deviceLineLoader.setOnLoading(true);
            let devices = yield this.deviceManager.getDeviceList(platform.name);
            let model = map(devices, (single) => {
                return {
                    value: single.targetId,
                    name: single.name
                };
            });
            if (this.isOldDeviceRequest(rid)) {
                return;
            }
            this.deviceSelect.setItems(model);
            if (def) {
                this.deviceSelect.resetSelection();
                this.deviceSelect.setSelectedItem(def.targetId);
            }
            this.deviceLineLoader.setOnLoading(false);
        });
    }
    updateVariants(def) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.variantManager) {
                return Promise.reject('INVALID_VARIANT_MANAGER');
            }
            this.variantsLineLoader.setOnLoading(true);
            let variantModel = yield this.variantManager.load();
            let model = map(variantModel.variants, (variant) => {
                return {
                    value: variant.name,
                    name: variant.name
                };
            });
            model.unshift({
                value: '',
                name: NONE_PLACEHOLDER
            });
            this.variantSelect.setItems(model);
            if (def) {
                this.variantSelect.setSelectedItem(def);
            }
            this.variantsLineLoader.setOnLoading(false);
        });
    }
    createRowId(elementId) {
        return "row-" + elementId;
    }
    createFormRow(text, element, rowId) {
        let row = createElement('div', {
            className: 'control-row',
            id: this.createRowId(rowId || element.id),
            elements: [
                text,
                element
            ]
        });
        return row;
    }
    contextualize(taskConfig, projectInfo) {
        if (!taskConfig) {
            return;
        }
        this.taskConfig = taskConfig;
        this.projectInfo = projectInfo;
        if (!this.deviceManager) {
            this.deviceManager = new CordovaDeviceManager(this.projectInfo.path);
        }
        if (!this.variantManager) {
            this.variantManager = new VariantsManager(this.projectInfo.path);
        }
        setTimeout(() => {
            this.setAllTabsVisibility(true);
            this.contextualizeImpl();
        });
    }
    setAllTabsVisibility(visible) {
        let ids = this.tabbedView.getAllIds();
        forEach(ids, (singleId) => {
            let tab = this.tabbedView.getTabItemById(singleId);
            if (tab) {
                tab.view.style.visibility = visible ? 'visible' : 'hidden';
            }
        });
    }
    setRowVisible(rowId, visible) {
        var el = document.getElementById(rowId);
        if (el && el.style) {
            el.style.display = visible ? 'block' : 'none';
        }
    }
    setElementVisible(el, visible) {
        if (el && el.style) {
            el.style.display = visible ? 'block' : 'none';
        }
    }
    contextualizeImpl() {
        this.updatePlatforms(this.taskConfig.selectedPlatform);
        this.applyConstraintsToView(this.taskConfig.constraints);
        this.taskViewEnvironmentTab.contextualize(this.taskConfig, this.projectInfo);
    }
    applyConstraintsToView(constraints) {
        if (constraints.isDeviceEnabled) {
            this.updateDevices(this.getSelectedPlatform(), this.taskConfig.device);
        }
        this.setRowVisible(this.createRowId('devices'), constraints.isDeviceEnabled);
        if (constraints.isVariantEnabled) {
            this.updateVariants(this.taskConfig.variantName);
        }
        this.setRowVisible(this.createRowId('variants'), constraints.isVariantEnabled);
        if (constraints.isNodeTaskEnabled) {
            this.updateNodeScripts(this.taskConfig.nodeTasks ? this.taskConfig.nodeTasks[0] : null);
        }
        this.setRowVisible(this.createRowId('npmScript'), constraints.isNodeTaskEnabled);
        if (constraints.isCustom) {
            this.updateTaskName();
        }
        this.setElementVisible(this.taskNameEl.element(), constraints.isCustom);
    }
    resetContext() {
        this.taskNameEl.setValue('');
        this.platformSelect.setItems([]);
        this.deviceSelect.setItems([]);
        this.variantSelect.setItems([]);
        this.npmScriptsSelect.setItems([]);
        this.setAllTabsVisibility(false);
    }
    getSelectedPlatform() {
        let platformValue = this.platformSelect.getSelectedItem();
        if (platformValue) {
            return { name: platformValue };
        }
        return null;
    }
    getSelectedDevice() {
        let value = this.deviceSelect.getSelectedItem();
        if (value) {
            return {
                targetId: value,
                name: value
            };
        }
        return null;
    }
    getSelectedVariantName() {
        let value = this.variantSelect.getSelectedItem();
        return value || null;
    }
    getSelectedNpmScript() {
        let value = this.npmScriptsSelect.getSelectedItem();
        Logger.consoleLog('selectedItem:', value);
        return value || null;
    }
    getCurrentConfiguration() {
        Logger.consoleLog("getCurrentConfiguration");
        let platformValue = this.platformSelect.getSelectedItem();
        if (platformValue) {
            this.taskConfig.selectedPlatform = { name: platformValue };
        }
        let device = this.deviceSelect.getSelectedItem();
        if (device) {
            this.taskConfig.device = {
                targetId: device,
                name: device
            };
        }
        let release = this.isReleaseEl['checked'];
        if (release) {
            this.taskConfig.isRelease = true;
        }
        let variant = this.getSelectedVariantName();
        if (variant) {
            this.taskConfig.variantName = variant;
        }
        else {
            this.taskConfig ? this.taskConfig.variantName = null : null;
        }
        let nodeScript = this.getSelectedNpmScript();
        if (nodeScript) {
            this.taskConfig.nodeTasks = [nodeScript];
        }
        else {
            this.taskConfig ? this.taskConfig.nodeTasks = null : null;
        }
        return this.taskConfig;
    }
}
//# sourceMappingURL=TaskViewContentPanel.js.map