'use babel';
import { createElement } from '../../element/index';
import { EventBus } from '../../DEWorkbench/EventBus';
import { EventEmitter } from 'events';
import { DEWorkbench } from '../../DEWorkbench/DEWorkbench';
import { ViewManager } from '../../DEWorkbench/ViewManager';
import { UIPane } from '../../ui-components/UIPane';
import { ServerManager, ServerStatus } from '../../DEWorkbench/services/ServerManager';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UITreeView, findItemInTreeModel } from '../../ui-components/UITreeView';
const { CompositeDisposable } = require('atom');
const md5 = require('md5');
const _ = require('lodash');
export class ServersView extends UIPane {
    constructor(uri) {
        super(uri, "Servers");
    }
    createUI() {
        this.treeModel = new ServersTreeModel();
        this.treeView = new UITreeView(this.treeModel);
        this.treeView.addEventListener('didItemSelected', (nodeId, nodeItem) => {
            let nodeType = _.find(nodeItem.attributes, { 'name': 'srvNodeType' });
            console.log("Node clicked: ", nodeType);
            this.updateToolbar(nodeType.value);
        });
        this.treeView.addEventListener('didItemDblClick', (nodeId, nodeItem) => {
            let nodeType = _.find(nodeItem.attributes, { 'name': 'srvNodeType' });
            console.log("Node dbl clicked: ", nodeType);
            if (nodeType.value === "serverInstance") {
                let nodeId = this.treeView.getCurrentSelectedItemId();
                let nodeItem = this.treeModel.getItemById(nodeId);
                this.doConfigureInstance(nodeItem.serverInstance, false);
            }
        });
        this.toolbar = new ServersToolbar();
        this.toolbar.addEventListener('didActionClick', (action) => {
            this.doToolbarAction(action);
        });
        let el = createElement('de-workbench-servers-view', {
            elements: [
                this.toolbar.element(),
                this.treeView.element()
            ],
            className: 'de-workbench-servers-view'
        });
        EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_NAME_CHANGED, (data) => {
            this.treeModel.reload();
        });
        EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_REMOVED, (data) => {
            this.treeModel.reload();
        });
        atom["contextMenu"].add({ '.de-workbench-servers-treeview-instance-item': [{ label: 'Start Server', command: 'dewb-menu-view-:start-server' }, { label: 'Stop Server', command: 'dewb-menu-view-:stop-server' }] });
        let commands = atom.commands.add('.de-workbench-servers-treeview-instance-item', {
            'dewb-menu-view-:start-server': (evt) => this.doStartServer(evt),
            'dewb-menu-view-:stop-server': (evt) => this.doStopServer(evt)
        });
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(commands);
        return el;
    }
    doStartServer(evt) {
        let targetElement = evt.target;
        let nodeId = undefined;
        if (targetElement.classList.contains('de-workbench-servers-treeview-instance-item')) {
            nodeId = targetElement.getAttribute("treeitemId");
        }
        else if (targetElement.parentElement && targetElement.parentElement.classList.contains('de-workbench-servers-treeview-instance-item')) {
            nodeId = targetElement.parentElement.getAttribute("treeitemId");
        }
        if (nodeId) {
            let nodeItem = this.treeModel.getItemById(nodeId);
            if (nodeItem) {
                if (nodeItem.serverInstance) {
                    if (nodeItem.serverInstance.status === ServerStatus.Stopped) {
                        nodeItem.serverInstance.start();
                    }
                }
            }
            else {
            }
        }
    }
    doStopServer(evt) {
        let targetElement = evt.target;
        let nodeId = undefined;
        if (targetElement.classList.contains('de-workbench-servers-treeview-instance-item')) {
            nodeId = targetElement.getAttribute("treeitemId");
        }
        else if (targetElement.parentElement && targetElement.parentElement.classList.contains('de-workbench-servers-treeview-instance-item')) {
            nodeId = targetElement.parentElement.getAttribute("treeitemId");
        }
        if (nodeId) {
            let nodeItem = this.treeModel.getItemById(nodeId);
            if (nodeItem) {
                if (nodeItem.serverInstance) {
                    if (nodeItem.serverInstance.status === ServerStatus.Running) {
                        nodeItem.serverInstance.stop();
                    }
                }
            }
            else {
            }
        }
    }
    updateToolbar(nodeType) {
        if (nodeType === "root") {
            this.toolbar.enableActions([]);
        }
        else if (nodeType === "serverProvider") {
            this.toolbar.enableActions([ServersToolbar.ActionNewServerInstance]);
        }
        else if (nodeType === "serverInstance") {
            this.toolbar.enableActions([ServersToolbar.ActionStartServerInstance, ServersToolbar.ActionStopServerInstance, ServersToolbar.ActionRemoveServerInstance]);
        }
    }
    doToolbarAction(action) {
        let nodeId = this.treeView.getCurrentSelectedItemId();
        let nodeItem = this.treeModel.getItemById(nodeId);
        this.doToolbarActionForNode(action, nodeItem);
    }
    doToolbarActionForNode(action, nodeItem) {
        if (action === ServersToolbar.ActionNewServerInstance) {
            this.createNewServerInstanceForNode(nodeItem);
        }
        else if (action === ServersToolbar.ActionRemoveServerInstance) {
            this.removeServerInstanceForNode(nodeItem);
        }
        else if (action === ServersToolbar.ActionStartServerInstance) {
            this.startServerInstanceForNode(nodeItem);
        }
        else if (action === ServersToolbar.ActionStopServerInstance) {
            this.stopServerInstanceForNode(nodeItem);
        }
        else if (action === ServersToolbar.ActionConfigureServerInstance) {
            this.configureServerInstanceForNode(nodeItem);
        }
    }
    destroy() {
        this.toolbar.destroy();
        this.treeView.destroy();
        this.treeModel.destroy();
        super.destroy();
    }
    createNewServerInstanceForNode(nodeItem) {
        if (nodeItem && nodeItem.serverProvider) {
            this.createNewServerProviderFor(nodeItem.serverProvider);
        }
    }
    removeServerInstanceForNode(nodeItem) {
        if (nodeItem && nodeItem.serverInstance) {
            const selected = atom.confirm({
                message: 'Delete Server Instance',
                detailedMessage: 'Do you want to confirm the ' + nodeItem.serverInstance.name + ' server instance deletion ?',
                buttons: ['Yes, Delete it', 'Cancel']
            });
            if (selected == 0) {
                this.removeServerInstance(nodeItem.serverInstance);
            }
        }
    }
    startServerInstanceForNode(nodeItem) {
        if (nodeItem && nodeItem.serverInstance && nodeItem.serverInstance.status === ServerStatus.Stopped) {
            nodeItem.serverInstance.start();
        }
    }
    stopServerInstanceForNode(nodeItem) {
        if (nodeItem && nodeItem.serverInstance && nodeItem.serverInstance.status === ServerStatus.Running) {
            nodeItem.serverInstance.stop();
        }
    }
    configureServerInstanceForNode(nodeItem) {
        this.doConfigureInstance(nodeItem.serverInstance, false);
    }
    createNewServerProviderFor(serverProvider) {
        let newInstanceName = "New Server";
        let instance = ServerManager.getInstance().createServerInstance(serverProvider.id, newInstanceName, {});
        this.treeModel.reload();
        this.doConfigureInstance(instance, true);
    }
    doConfigureInstance(serverInstance, isNew) {
        DEWorkbench.default.viewManager.openView(ViewManager.VIEW_SERVER_INSTANCE(serverInstance), { isNew: isNew });
    }
    removeServerInstance(serverInstance) {
        ServerManager.getInstance().removeServerInstance(serverInstance);
    }
}
class ServersToolbar extends UIBaseComponent {
    static get ActionNewServerInstance() { return 'newInstance '; }
    static get ActionRemoveServerInstance() { return 'removeInstance '; }
    static get ActionStartServerInstance() { return 'start '; }
    static get ActionStopServerInstance() { return 'stop '; }
    static get ActionConfigureServerInstance() { return 'configure '; }
    constructor() {
        super();
        this.events = new EventEmitter();
        this.initUI();
    }
    initUI() {
        this.addInstanceButton = createElement('button', {
            className: 'btn btn-xs icon icon-gist-new'
        });
        atom["tooltips"].add(this.addInstanceButton, { title: 'Create new Server instance' });
        this.addInstanceButton.addEventListener('click', (evt) => {
            this.events.emit('didActionClick', ServersToolbar.ActionNewServerInstance);
        });
        this.removeInstanceButton = createElement('button', {
            className: 'btn btn-xs icon icon-dash'
        });
        atom["tooltips"].add(this.removeInstanceButton, { title: 'Delete selected Server instance' });
        this.removeInstanceButton.addEventListener('click', () => {
            this.events.emit('didActionClick', ServersToolbar.ActionRemoveServerInstance);
        });
        this.startInstanceButton = createElement('button', {
            className: 'btn btn-xs icon icon-playback-play'
        });
        atom["tooltips"].add(this.startInstanceButton, { title: 'Start selected Server instance' });
        this.startInstanceButton.addEventListener('click', () => {
            this.events.emit('didActionClick', ServersToolbar.ActionStartServerInstance);
        });
        this.stopInstanceButton = createElement('button', {
            className: 'btn btn-xs icon icon-primitive-square'
        });
        atom["tooltips"].add(this.stopInstanceButton, { title: 'Stop selected Server instance' });
        this.stopInstanceButton.addEventListener('click', () => {
            this.events.emit('didActionClick', ServersToolbar.ActionStopServerInstance);
        });
        this.configureInstanceButton = createElement('button', {
            className: 'btn btn-xs icon icon-gear'
        });
        atom["tooltips"].add(this.configureInstanceButton, { title: 'Configure selected Server instance' });
        this.configureInstanceButton.addEventListener('click', () => {
            this.events.emit('didActionClick', ServersToolbar.ActionConfigureServerInstance);
        });
        let tabbedToolbar = createElement('div', {
            elements: [
                createElement('div', {
                    elements: [this.addInstanceButton, this.removeInstanceButton, this.startInstanceButton, this.stopInstanceButton, this.configureInstanceButton],
                    className: 'btn-group'
                })
            ], className: 'btn-toolbar'
        });
        tabbedToolbar.style.float = "right";
        let toolbarContainer = createElement('div', {
            elements: [tabbedToolbar],
            className: 'de-workbench-servers-toolbar-container'
        });
        this.disableAllActions();
        this.mainElement = toolbarContainer;
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        super.destroy();
        this.events.removeAllListeners();
        this.events = null;
    }
    enableActions(actions) {
        this.disableAllActions();
        for (var i = 0; i < actions.length; i++) {
            this.enableButton(this.buttoForAction(actions[i]));
        }
    }
    buttoForAction(action) {
        if (action === ServersToolbar.ActionNewServerInstance) {
            return this.addInstanceButton;
        }
        else if (action === ServersToolbar.ActionRemoveServerInstance) {
            return this.removeInstanceButton;
        }
        else if (action === ServersToolbar.ActionStartServerInstance) {
            return this.startInstanceButton;
        }
        else if (action === ServersToolbar.ActionStopServerInstance) {
            return this.stopInstanceButton;
        }
    }
    disableAllActions() {
        this.disableButton(this.addInstanceButton);
        this.disableButton(this.removeInstanceButton);
        this.disableButton(this.startInstanceButton);
        this.disableButton(this.stopInstanceButton);
    }
    disableButton(button) {
        button.setAttribute('disabled', '');
    }
    enableButton(button) {
        button.removeAttribute('disabled');
    }
}
class ServersTreeModel {
    constructor() {
        this.events = new EventEmitter();
        this.reload();
    }
    reload() {
        let providers = ServerManager.getInstance().getProviders();
        let providerItems = new Array();
        for (var i = 0; i < providers.length; i++) {
            let providerItem = new ServerProviderItem(providers[i], this);
            providerItems.push(providerItem);
        }
        this.root = new ServerRootItem();
        this.root.children = providerItems;
        this.events.emit("didModelChanged");
    }
    getItemById(id) {
        return findItemInTreeModel(id, this);
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        this.events.removeAllListeners();
        this.events = null;
    }
    onItemChanged(item) {
        this.events.emit("didModelChanged");
    }
}
class ServerRootItem {
    constructor() {
        this.id = "___servers";
        this.name = "Servers";
        this.className = "de-workbench-servers-treeview-root-item";
        this.icon = "icon-globe";
        this.expanded = true;
        this.attributes = [{
                name: 'srvNodeType',
                value: 'root'
            }];
    }
}
class ServerProviderItem {
    constructor(serverProvider, listener) {
        this.className = "de-workbench-servers-treeview-provider-item";
        this.icon = "icon-database";
        this.expanded = true;
        this.attributes = [{
                name: 'srvNodeType',
                value: 'serverProvider'
            }];
        this.listener = listener;
        this.serverProvider = serverProvider;
        this.name = this.serverProvider.getProviderName();
        this.id = this.toIdFromName(this.name);
        this.expanded = true;
        this.children = [];
        let instances = ServerManager.getInstance().getInstancesForProvider(this.serverProvider.getProviderName());
        for (var i = 0; i < instances.length; i++) {
            this.children.push(new ServerInstanceItem(instances[i], this));
        }
        console.log(this.children.length);
    }
    toIdFromName(name) {
        let id = md5(name);
        return id;
    }
    onItemChanged(item) {
        this.listener.onItemChanged(item);
    }
}
export class ServerInstanceItem {
    constructor(serverInstance, listener) {
        this.className = "de-workbench-servers-treeview-instance-item";
        this.icon = "";
        this.expanded = true;
        this.attributes = [{
                name: 'srvNodeType',
                value: 'serverInstance'
            }];
        this.listener = listener;
        this.serverInstance = serverInstance;
        this.name = this.serverInstance.name;
        this.id = serverInstance.instanceId;
        this.expanded = true;
        EventBus.getInstance().subscribe(ServerManager.EVT_SERVER_INSTANCE_STATUS_CHANGED, (eventData) => {
            let serverInstance = eventData[0];
            if (serverInstance.instanceId === this.serverInstance.instanceId) {
                this.onServerStatusChanged(true);
            }
        });
        this.onServerStatusChanged(false);
    }
    onServerStatusChanged(notify) {
        this.className = "de-workbench-servers-treeview-instance-item";
        if (this.serverInstance.status === ServerStatus.Running) {
            this.icon = "icon-pulse";
            this.className = this.className + " instance-running";
        }
        else if (this.serverInstance.status === ServerStatus.Stopped) {
            this.icon = "icon-primitive-square";
            this.className = this.className + " instance-stopped";
        }
        else if (this.serverInstance.status === ServerStatus.Starting) {
            this.icon = "icon-rocket";
            this.className = this.className + " instance-starting";
        }
        else if (this.serverInstance.status === ServerStatus.Stopping) {
            this.icon = "icon-primitive-dot";
            this.className = this.className + " instance-stopping";
        }
        if (notify) {
            this.listener.onItemChanged(this);
        }
    }
    toIdFromName(name) {
        let id = md5(name);
        return id;
    }
}
//# sourceMappingURL=ServersView.js.map