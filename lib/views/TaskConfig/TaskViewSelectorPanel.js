'use babel';
import { createElement, insertElement } from '../../element/index';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UITreeView, findItemInTreeModel } from '../../ui-components/UITreeView';
import { map, filter, reject, find } from 'lodash';
const StringHash = require('string-hash');
export class TaskViewSelectorPanel extends UIBaseComponent {
    constructor(evtEmitter) {
        super();
        this.evtEmitter = evtEmitter;
        this.initUI();
    }
    buildTreeModel(cvdTasks) {
        let customTaskNode = this.createCustomTaskNode(filter(cvdTasks, (item) => {
            return item.constraints.isCustom;
        }));
        let cvdTaskNode = this.createCdvTaskNode(reject(cvdTasks, (item) => {
            return item.constraints.isCustom;
        }));
        let root = {
            id: 'root',
            name: 'task',
            expanded: true,
            children: [
                cvdTaskNode,
                customTaskNode
            ]
        };
        this.treeModel = {
            root: root,
            getItemById: (id) => { return findItemInTreeModel(id, this.treeModel); },
            addEventListener: (event, listener) => { },
            removeEventListener: (event, listener) => { },
            destroy: () => { }
        };
    }
    initUI() {
        this.mainElement = createElement('atom-panel', {
            className: 'de-workbench-taskpanel-tree-area',
        });
        this.createButtonToolbar();
    }
    createButtonToolbar() {
        let removeTaskButton = createElement('button', {
            className: 'btn btn-xs icon icon-dash'
        });
        atom["tooltips"].add(removeTaskButton, { title: 'Remove selected task' });
        removeTaskButton.addEventListener('click', () => {
            this.evtEmitter.emit('didRemoveTask');
        });
        let cloneTaskButton = createElement('button', {
            className: 'btn btn-xs icon icon-clippy'
        });
        atom["tooltips"].add(cloneTaskButton, { title: 'Clone selected Variant' });
        cloneTaskButton.addEventListener('click', () => {
            this.evtEmitter.emit('didCloneTask');
        });
        let toolbar = createElement('div', {
            elements: [
                createElement('div', {
                    elements: [removeTaskButton, cloneTaskButton],
                    className: 'btn-group'
                })
            ], className: 'btn-toolbar'
        });
        insertElement(this.mainElement, toolbar);
    }
    buildAndAddTreeView(cdvTasks) {
        this.cdvTasks = cdvTasks;
        this.buildTreeModel(cdvTasks);
        if (!this.treeView) {
            this.treeView = new UITreeView(this.treeModel);
            this.treeView.addEventListener('didItemSelected', this.onItemSelected.bind(this));
            insertElement(this.mainElement, this.treeView.element());
        }
        else {
            this.treeView.setModel(this.treeModel);
        }
    }
    createCustomTaskNode(cvdCustomTasks) {
        let children = map(cvdCustomTasks, (item) => {
            return { id: StringHash(item.name), name: item.name };
        });
        return { id: 'custom', name: 'Custom', icon: null,
            expanded: true,
            children: children
        };
    }
    createCdvTaskNode(cvdTask) {
        let children = map(cvdTask, (item) => {
            return { id: StringHash(item.name), name: item.displayName };
        });
        return { id: 'default', name: 'Cordova', icon: null,
            expanded: true,
            children: children
        };
    }
    onItemSelected(itemId, item) {
        console.log("selected: ", itemId, item);
        if (this.taskSelectionListener) {
            this.taskSelectionListener(this.translateItemIdToTaskId(itemId));
        }
    }
    setSelected(itemId, value) {
        this.treeView.selectItemById(StringHash(itemId), value);
    }
    setOnTaskChangeListener(callback) {
        this.taskSelectionListener = callback;
    }
    translateItemIdToTaskId(itemId) {
        let task = find(this.cdvTasks, (item) => {
            return itemId == StringHash(item.name);
        });
        if (task) {
            return task.name;
        }
        return itemId;
    }
}
//# sourceMappingURL=TaskViewSelectorPanel.js.map