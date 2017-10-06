'use babel';
import { createElement, insertElement } from '../../element/index';
import { UIExtComponent } from '../../ui-components/UIComponent';
import { TaskProvider } from '../../tasks/TaskProvider';
import { TaskUtils } from '../../tasks/TaskUtils';
import { find, cloneDeep, remove } from 'lodash';
import { EventEmitter } from 'events';
import { Logger } from '../../logger/Logger';
import { TaskViewContentPanel } from './TaskViewContentPanel';
import { TaskViewSelectorPanel } from './TaskViewSelectorPanel';
const RELOAD_DELAY = 500;
export class TaskViewPanel extends UIExtComponent {
    constructor() {
        super();
        this.tasks = [];
        this.evtEmitter = new EventEmitter();
        this.initUI();
    }
    initUI() {
        this.mainElement = createElement('div', {
            className: 'de-workbench-taskpanel-container'
        });
        this.threeViewPanel = this.createTreeViewPanel();
        this.threeViewPanel.setOnTaskChangeListener((itemId) => {
            this.applyConfigToModel(this.lastSelected);
            let config = this.getTaskConfigurationByName(itemId);
            Logger.consoleLog("getTaskConfigurationByName return", config, "For name", itemId);
            if (config) {
                this.lastSelected = config;
            }
            this.taskContentPanel.contextualize(config, this.project);
            this.fireEvent('didTaskSelected', config);
        });
        this.evtEmitter.addListener('didAddTask', () => {
            Logger.consoleLog("Add task");
        });
        this.evtEmitter.addListener('didRemoveTask', () => {
            Logger.consoleLog("Remove task");
            let target = this.lastSelected;
            if (target.constraints.isCustom) {
                this.removeTask(target);
                this.lastSelected = null;
            }
            setTimeout(() => {
                this.update();
                this.taskContentPanel.resetContext();
            });
        });
        let timer = null;
        this.evtEmitter.addListener('didChangeName', (nodeId) => {
            if (timer) {
                clearTimeout(timer);
            }
            timer = setTimeout(() => {
                timer = null;
                this.update();
                this.threeViewPanel.setSelected(nodeId, true);
            }, RELOAD_DELAY);
        });
        this.evtEmitter.addListener('didCloneTask', () => {
            Logger.consoleLog("Duplicate task");
            if (this.lastSelected) {
                this.cloneAndAddNewTasks(this.lastSelected);
                setTimeout(() => {
                    this.update();
                });
            }
        });
        this.taskContentPanel = this.createContentPanel();
        insertElement(this.mainElement, this.threeViewPanel.element());
        insertElement(this.mainElement, this.taskContentPanel.element());
    }
    createContentPanel() {
        let taskContentPanel = new TaskViewContentPanel(this.evtEmitter);
        return taskContentPanel;
    }
    createTreeViewPanel() {
        let taskThreeViewContainer = new TaskViewSelectorPanel(this.evtEmitter);
        return taskThreeViewContainer;
    }
    setProject(project) {
        this.project = project;
        this.loadTasks();
    }
    loadTasks() {
        TaskProvider.getInstance().loadTasksForProject(this.project.path).then((tasks) => {
            Logger.getInstance().debug("Task loading done");
            this.tasks = tasks;
            this.update();
        }, (err) => {
            Logger.getInstance().error(err);
        }).catch((ex) => {
            Logger.getInstance().error(ex);
        });
    }
    update() {
        this.threeViewPanel.buildAndAddTreeView(this.tasks);
    }
    getTaskConfigurationByName(name) {
        return find(this.tasks, (single) => {
            return single.name == name;
        });
    }
    cloneAndAddNewTasks(lastSelected) {
        let newTask = cloneDeep(lastSelected);
        newTask.name = TaskUtils.createUniqueTaskName(this.tasks, lastSelected.name);
        newTask.constraints.isCustom = true;
        this.tasks.push(newTask);
    }
    removeTask(task) {
        remove(this.tasks, (item) => {
            return item.name == task.name;
        });
    }
    getConfiguration() {
        return this.taskContentPanel.getCurrentConfiguration();
    }
    applyConfigToModel(config) {
        this.taskContentPanel.getCurrentConfiguration();
    }
    saveAllConfiguration() {
        if (this.lastSelected) {
            this.applyConfigToModel(this.lastSelected);
        }
        if (this.project) {
            TaskProvider.getInstance().storeTasks(this.tasks, this.project.path);
        }
    }
}
//# sourceMappingURL=TaskViewPanel.js.map