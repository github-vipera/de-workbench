'use babel';
import { createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
import { UISelect } from './UISelect';
import { UISelectButton } from './UISelectButton';
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Logger } from '../logger/Logger';
import * as _ from 'lodash';
import * as path from 'path';
const OPEN_TASK_CONF = {
    name: 'Custom...',
    value: ''
};
export class UIRunSelectorComponent extends UIBaseComponent {
    constructor(events) {
        super();
        this.projectSelector = null;
        this.taskSelect = null;
        this.taskHistory = [];
        this.events = events;
        this.projectSelectListener = {
            onItemSelected: (selection) => {
                this.onSelectProject(selection);
            }
        };
        this.taskSelectListener = {
            onItemSelected: (selection) => {
                if (!selection) {
                    this.onCustomTaskSelectClick();
                    setTimeout(() => {
                        this.taskSelectButton.resetSelection();
                        this.events.emit("didTaskSelected", null);
                    }, 20);
                }
                else {
                    let task = _.find(this.taskHistory, (item) => {
                        return item.name == selection;
                    });
                    Logger.consoleLog('emit event for', task);
                    this.events.emit("didTaskSelected", task);
                }
            }
        };
        this.initUI();
        this.subscribeEvents();
    }
    initUI() {
        this.mainElement = createElement('div', {
            className: "de-workbench-uiruncomponent-container"
        });
        this.addProjectSelector();
        this.addTaskSelector();
    }
    addProjectSelector() {
        let projects = this.getAllAvailableProjects();
        this.projectSelector = this.createProjectSelector(projects);
        this.projectSelector.addSelectListener(this.projectSelectListener);
        this.projectSelector.resetSelection();
        this.selectButton = new UISelectButton(this.projectSelector, "Select Project", { withArrow: true, rightIcon: 'arrow-down' });
        insertElement(this.mainElement, this.selectButton.element());
    }
    addTaskSelector() {
        this.taskSelect = this.createTaskSelect();
        this.taskSelect.resetSelection();
        this.taskSelect.addSelectListener(this.taskSelectListener);
        this.taskSelectButton = new UISelectButton(this.taskSelect, "...", { withArrow: false, rightIcon: 'arrow-down' });
        insertElement(this.mainElement, this.taskSelectButton.element());
    }
    subscribeEvents() {
        ProjectManager.getInstance().didPathChanged(this.reloadProjectList.bind(this));
    }
    reloadProjectList() {
        Logger.consoleLog("reloadProjectList");
        let projects = this.getAllAvailableProjects();
        let items = this.createProjectSelectOptions(projects);
        let selected = this.projectSelector.getSelectedItem();
        this.projectSelector.setItems(items);
        let reloadSelection = (!selected || selected != this.projectSelector.getSelectedItem()) ? true : false;
        if (reloadSelection) {
            this.selectButton.setSelectedItem(items[0].value);
            this.onSelectProject(items[0].value);
        }
    }
    getAllAvailableProjects() {
        return ProjectManager.getInstance().getAllAvailableProjects();
    }
    createProjectSelector(projects) {
        let options = this.createProjectSelectOptions(projects);
        Logger.consoleLog("OPTIONS:", options);
        return new UISelect(options);
    }
    createProjectSelectOptions(projects) {
        let options = [];
        if (!projects || projects.length == 0) {
            options.push({
                name: 'No projects',
                value: ''
            });
            return options;
        }
        _.forEach(projects, (item) => {
            options.push({
                name: path.basename(item),
                value: item
            });
        });
        return options;
    }
    createTaskSelect() {
        let options = this.createTaskSelectOptions(this.taskHistory);
        return new UISelect(options);
    }
    reloadTaskList() {
        this.taskSelect.setItems(this.createTaskSelectOptions(this.taskHistory));
    }
    createTaskSelectOptions(tasks) {
        let options = [];
        _.forEach(tasks, (item) => {
            options.push({
                name: item.constraints.isCustom ? item.name : item.displayName,
                value: item.name
            });
        });
        options.push(OPEN_TASK_CONF);
        return options;
    }
    onCustomTaskSelectClick() {
        Logger.consoleLog("onCustomTaskSelectClick");
        this.events.emit('didSelectTaskClick');
    }
    onSelectProject(path) {
        Logger.consoleLog("onSelectProject", path);
        setTimeout(() => {
            ProjectManager.getInstance().cordova.getProjectInfo(path).then((info) => {
                Logger.consoleLog("onSelectProject info:", info);
                this.events.emit('didSelectProjectForRun', info);
            }, (reason) => {
                console.error(reason);
            }).catch((err) => {
                console.error(err);
            });
        });
    }
    updateTaskText(taskInfo) {
        if (!taskInfo) {
            this.taskSelectButton.resetSelection();
        }
        else {
            this.taskSelectButton.setSelectedItem(taskInfo.name);
        }
    }
    setTaskConfiguration(taskInfo) {
        this.taskInfo = taskInfo;
        this.addTaskToHistory(taskInfo);
        this.reloadTaskList();
        this.updateTaskText(taskInfo);
    }
    clearHistory() {
        this.taskHistory = [];
    }
    addTaskToHistory(taskInfo) {
        if (!taskInfo) {
            return;
        }
        let index = _.findIndex(this.taskHistory, (item) => {
            return item === taskInfo;
        });
        if (index >= 0) {
            return;
        }
        this.taskHistory.unshift(taskInfo);
        this.taskHistory = this.taskHistory.slice(0, 5);
    }
    getTaskConfiguration() {
        return this.taskInfo;
    }
    setEnable(value) {
        this.projectSelector.setEnable(value);
    }
    destroy() {
        this.taskSelect.removeSelectListener(this.taskSelectListener);
        this.projectSelector.removeSelectListener(this.projectSelectListener);
        this.selectButton.destroy();
        this.element().remove();
    }
}
//# sourceMappingURL=UIRunSelectorComponent.js.map