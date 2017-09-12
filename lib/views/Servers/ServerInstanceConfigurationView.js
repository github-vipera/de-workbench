'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
import { ServerManager, ServerStatus } from '../../DEWorkbench/services/ServerManager';
import { UIExtComponent } from '../../ui-components/UIComponent';
import { Logger } from '../../logger/Logger';
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView';
import { UILoggerComponent } from '../../ui-components/UILoggerComponent';
import { UICommonsFactory, FormActionType } from '../../ui-components/UICommonsFactory';
import { UINotifications } from '../../ui-components/UINotifications';
import { UIEditableLabel } from '../../ui-components/UIEditableLabel';
import { EventBus } from '../../DEWorkbench/EventBus';
//const md5 = require('md5')
const _ = require('lodash');
export class ServerInstanceConfigurationView extends UIPane {
    constructor(params) {
        super(params);
        this._removed = false;
        console.log("this.paneId " + this.paneId);
        Logger.getInstance().debug("ServerInstanceConfigurationView creating for ", this.paneId);
    }
    createUI() {
        this._serverInstance = this.options.userData.serverInstance;
        this._configCtrl = new ServerInstanceConfigurationCtrl(this._serverInstance);
        this._overlayEl = createElement('div', {
            className: 'de-workbench-overlay de-workbench-server-overlay'
        });
        this.showOverlay(false);
        let mainContainer = createElement('div', {
            elements: [this._configCtrl.element(), this._overlayEl],
            className: 'de-workbench-server-config-pane'
        });
        EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_NAME_CHANGED, (eventData) => {
            let instanceId = eventData[0];
            // filter events only for this server
            if (this._serverInstance && instanceId.instanceId === this._serverInstance.instanceId) {
                this.onInstanceRenamed();
            }
        });
        EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_REMOVED, (eventData) => {
            let instanceId = eventData[0];
            // filter events only for this server
            if (this._serverInstance && instanceId === this._serverInstance.instanceId) {
                this._serverInstance = null;
                this.onInstanceRemoved();
            }
        });
        return mainContainer;
    }
    showOverlay(show) {
        this._removed = true;
        this._configCtrl.invalidate();
        this._overlayEl.style.visibility = (show ? 'visible' : 'hidden');
    }
    onInstanceRemoved() {
        this.showOverlay(true);
    }
    didOpen() {
        if (this.options.userData && this.options.userData.isNew) {
            if (this.options.userData.isNew) {
                this._configCtrl.startEditName();
                this.options.userData.isNew = false;
            }
        }
    }
    onInstanceRenamed() {
        super.setTitle(this._serverInstance.name);
        //this.setPaneTitle("Pippo")
    }
    getTitle() {
        return "Server [" + super.getTitle() + "]";
    }
}
class ServerInstanceConfigurationCtrl extends UIExtComponent {
    constructor(serverInstance) {
        super();
        this._removed = false;
        this._serverInstance = serverInstance;
        this.initUI();
    }
    initUI() {
        this._headerCtrl = new HeaderCtrl(this._serverInstance);
        this._headerCtrl.addEventListener('didActionClick', (action) => {
            alert("action:" + action);
        });
        //this._logCtrl = new ServerLogView(this._serverInstance);
        this._confCtrl = new ConfigContainerControl(this._serverInstance);
        this._confCtrl.addEventListener('didConfigurationChange', (evt) => {
            console.log("TODO enable Save button and Revert Changes!");
        });
        this._confCtrl.addEventListener('didSaveChange', (evt) => {
            console.log("TODO Save Changes!");
        });
        this._confCtrl.addEventListener('didRevertChange', (evt) => {
            console.log("TODO Revert Changes!");
        });
        this._tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
        this._tabbedView.element().classList.add('de-workbench-server-config-tabbedview');
        //this._tabbedView.addView(new UITabbedViewItem('log',       'Log',  this._logCtrl.element() ));
        this._tabbedView.addView(new UITabbedViewItem('configuration', 'Configuration', this._confCtrl.element()));
        this.mainElement = createElement('div', {
            elements: [this._headerCtrl.element(), this._tabbedView.element()],
            className: 'de-workbench-server-config-maincontainer'
        });
    }
    invalidate() {
        this._headerCtrl.invalidate();
        this._confCtrl.invalidate();
        this._removed;
    }
    startEditName() {
        this._headerCtrl.startEditName();
    }
    destroy() {
        super.destroy();
    }
}
class ConfigContainerControl extends UIExtComponent {
    constructor(serverInstance) {
        super();
        this._serverInstance = serverInstance;
        this.initUI();
    }
    initUI() {
        let savedConfiguration = this.getInstanceSettings().configuration;
        // get the configurator instance
        this._configurator = this._serverInstance.getConfigurator(savedConfiguration /*this._serverInstance.configuration*/);
        // set the current configuration
        this._configurator.applyConfiguration(savedConfiguration /*this._serverInstance.configuration*/);
        // then get the configurator UI
        this._configPanelElement = this._configurator.getConfigurationPane();
        let actionButtonsOpt = {
            cancel: {
                caption: 'Revert Changes'
            },
            commit: {
                caption: 'Save Changes'
            },
            actionListener: (actionType) => {
                if (actionType === FormActionType.Cancel) {
                    this.revertChanges();
                }
                else if (actionType === FormActionType.Commit) {
                    this.saveChanges();
                }
            }
        };
        let actionButtonsContainer = UICommonsFactory.createFormActions(actionButtonsOpt);
        this.mainElement = createElement('div', {
            elements: [this._configPanelElement, actionButtonsContainer],
            className: 'de-workbench-server-config-confelm-cont'
        });
        //listen for changes
        this._configurator.addEventListener('didConfigurationChange', (evt) => {
            this.fireConfigChanged();
        });
    }
    getInstanceSettings() {
        return ServerManager.getInstance().loadSettingsForServerInstance(this._serverInstance.instanceId);
    }
    revertChanges() {
        this._configurator.revertChanges();
        this.fireEvent("didRevertChange", this);
    }
    saveChanges() {
        let newConfig = this._configurator.getConfiguration();
        //store new config into the global preferences
        ServerManager.getInstance().storeInstanceConfiguration(this._serverInstance.instanceId, newConfig).then(() => {
            // then apply new config to the instance
            this._serverInstance.configure(newConfig);
            // store on configurator provider
            this._configurator.applyConfiguration(newConfig);
            // fire the event
            this.fireEvent("didSaveChange", this);
            UINotifications.showInfo("Changes saved successfully.");
        }, (err) => {
            UINotifications.showError("Error saving changes: " + err);
        });
    }
    fireConfigChanged() {
        this.fireEvent("didConfigurationChange", this);
    }
    invalidate() {
        this._removed = true;
    }
}
class HeaderCtrl extends UIExtComponent {
    constructor(serverInstance) {
        super();
        this._removed = false;
        EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_STATUS_CHANGED, (eventData) => {
            let serverInstance = eventData[0];
            // filter events only for this server
            if (serverInstance.instanceId === this._serverInstance.instanceId) {
                this.onServerStatusChanged(serverInstance);
            }
        });
        this._serverInstance = serverInstance;
        this.initUI();
    }
    static get ActionStartServerInstance() { return 'start'; }
    static get ActionStopServerInstance() { return 'stop'; }
    initUI() {
        this._editableTitle = new UIEditableLabel({
            caption: this._serverInstance.name,
            className: 'de-workbench-server-config-header-instanceName text-highlight'
        });
        this._editableTitle.addEventListener('didValueChange', (evt) => {
            let newName = this._editableTitle.getCaption();
            ServerManager.getInstance().changeInstanceName(this._serverInstance.instanceId, newName).then(() => {
                this.fireEvent("didNameChange", this);
                UINotifications.showInfo("Name changed successfully.");
            }, (err) => {
                UINotifications.showError("Error changing name: " + err);
            });
        });
        let serverProviderType = createElement('span', {
            elements: [createText(this._serverInstance.provider)],
            className: 'de-workbench-server-config-header-providerName text-subtle'
        });
        this._startInstanceButton = createElement('button', {
            elements: [createText("Start")],
            className: 'btn btn-xs icon icon-playback-play'
        });
        atom["tooltips"].add(this._startInstanceButton, { title: 'Start this Server instance' });
        this._startInstanceButton.addEventListener('click', () => {
            this.doStart();
        });
        this._stopInstanceButton = createElement('button', {
            elements: [createText("Stop")],
            className: 'btn btn-xs icon icon-primitive-square'
        });
        atom["tooltips"].add(this._stopInstanceButton, { title: 'Stop this Server instance' });
        this._stopInstanceButton.addEventListener('click', () => {
            this.doStop();
        });
        let tabbedToolbar = createElement('div', {
            elements: [
                createElement('div', {
                    elements: [this._startInstanceButton, this._stopInstanceButton],
                    className: 'btn-group'
                })
            ], className: 'btn-toolbar de-workbench-server-config-header-toolbar'
        });
        this._status = createElement('span', {
            elements: [createText("Unknown Status")],
            className: 'de-workbench-server-config-header-status'
        });
        let subCont = createElement('div', {
            elements: [serverProviderType, this._status],
            className: 'de-workbench-server-config-header-subcont'
        });
        this.mainElement = createElement('div', {
            elements: [this._editableTitle.element(), subCont, tabbedToolbar],
            className: 'de-workbench-server-config-header-cont'
        });
        this.setStatus(this._serverInstance.status);
    }
    startEditName() {
        this._editableTitle.startEdit();
    }
    onServerStatusChanged(serverInstance) {
        this.setStatus(serverInstance.status);
    }
    //highlight-success
    setStatus(status) {
        if (status === ServerStatus.Running) {
            //highlight-success
            this.cleanStatus();
            this._status.classList.add('highlight-success');
            this._status.innerText = "Running";
        }
        else if (status === ServerStatus.Stopped) {
            //highlight
            this.cleanStatus();
            this._status.classList.add('highlight-error');
            this._status.innerText = "Not Running";
        }
        else if (status === ServerStatus.Starting) {
            this.cleanStatus();
            this._status.classList.add('highlight-warning');
            this._status.innerText = "Starting";
        }
        else if (status === ServerStatus.Stopping) {
            this.cleanStatus();
            this._status.classList.add('highlight-warning');
            this._status.innerText = "Stopping";
        }
        else {
            this.cleanStatus();
            this._status.classList.add('highlight');
            this._status.innerText = "Unknown Status";
        }
    }
    cleanStatus() {
        this._status.classList.remove('highlight');
        this._status.classList.remove('highlight-info');
        this._status.classList.remove('highlight-warning');
        this._status.classList.remove('highlight-success');
        this._status.classList.remove('highlight-error');
    }
    destroy() {
        super.destroy();
    }
    doStart() {
        if (this._serverInstance.status === ServerStatus.Stopped) {
            this._serverInstance.start();
        }
    }
    doStop() {
        if (this._serverInstance.status === ServerStatus.Running) {
            this._serverInstance.stop();
        }
    }
    invalidate() {
        this._removed = true;
    }
}
class ServerLogView extends UIExtComponent {
    constructor(serverInstance) {
        super();
        this._serverInstance = serverInstance;
        this.initUI();
    }
    initUI() {
        this._loggerComponent = new UILoggerComponent(true);
        this.mainElement = createElement('div', {
            elements: [this._loggerComponent.element()],
            className: 'de-workbench-server-config-logger-cont'
        });
    }
}
//# sourceMappingURL=ServerInstanceConfigurationView.js.map