'use babel';
import { createElement } from '../../element/index';
import { UIExtendedListView } from '../../ui-components/UIExtendedListView';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UIButtonGroup, UIButtonGroupMode, UIButtonConfig } from '../../ui-components/UIButtonGroup';
import { Logger } from '../../logger/Logger';
import { EventEmitter } from 'events';
export class TaskViewEnvironmentTab extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        this.environmentVarRenderer = new TaskViewEnvironmentRenderer();
        this.cliParamsRenderer = new TaskViewCliParamsRenderer();
        this.mainElement = createElement('div', {
            className: 'task-env-tab-container',
            elements: [
                this.environmentVarRenderer.element(),
                this.cliParamsRenderer.element()
            ]
        });
    }
    contextualize(task, project) {
        if (!task.envVariables) {
            task.envVariables = [];
        }
        this.environmentVarRenderer.updateUI(task.envVariables);
        if (!task.cliParams) {
            task.cliParams = [];
        }
        this.cliParamsRenderer.updateUI(task.cliParams);
    }
}
class TaskViewEnvironmentRenderer extends UIBaseComponent {
    constructor() {
        super();
        this.events = new EventEmitter();
        this.initUI();
    }
    initUI() {
        this.initToolbar();
        this.initListView();
        this.mainElement = createElement('div', {
            elements: [this.toolbar, this.listView.element()],
            className: 'de-workbench-variants-ctrl-prop-renderer'
        });
    }
    initToolbar() {
        let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
        buttonGroup.addButton(new UIButtonConfig()
            .setId('add')
            .setCaption("+")
            .setClickListener(() => {
            this.model.addNewProperty();
        }));
        buttonGroup.addButton(new UIButtonConfig()
            .setId('add')
            .setCaption("-")
            .setClickListener(() => {
            this.removeSelectedRow();
        }));
        buttonGroup.element().classList.add('btn-group-xs');
        this.toolbar = createElement('div', {
            elements: [
                buttonGroup.element()
            ],
            className: 'de-workbench-variants-ctrl-toolbar'
        });
    }
    initListView() {
        this.model = this.buildModel([])
            .addEventListener('didModelChanged', () => {
            this.fireDataChanged();
        });
        this.listView = new UIExtendedListView(this.model);
    }
    removeSelectedRow() {
        let row = this.listView.getSelectedRow();
        this.model.removePropertyAt(row);
        this.events.emit("didPropertyRemoved");
    }
    updateUI(values) {
        Logger.consoleLog('update ui');
        this.model.forceProperties(values);
    }
    buildModel(values) {
        return new EnvironmentVarListViewModel(values);
    }
    fireDataChanged() {
        Logger.consoleLog('fireDataChanged');
        this.events.emit('didEnvironmenVarDataChanged');
    }
}
class EnvironmentVarListViewModel {
    constructor(properties) {
        this.events = new EventEmitter();
        this.properties = properties != null ? properties : [];
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
        return this;
    }
    addNewProperty() {
        this.properties.push({
            name: "New Env var Name",
            value: "New Env var Value"
        });
        this.fireModelChanged();
    }
    removePropertyAt(index) {
        if (index >= 0) {
            this.properties.splice(index, 1);
            this.fireModelChanged();
        }
    }
    hasHeader() {
        return true;
    }
    getRowCount() {
        return this.properties.length;
    }
    getColCount() {
        return 2;
    }
    getValueAt(row, col) {
        let property = this.properties[row];
        if (col === 0) {
            return property.name;
        }
        else if (col === 1) {
            return property.value;
        }
    }
    getClassNameAt(row, col) {
        return "";
    }
    getColumnName(col) {
        if (col === 0) {
            return "Env Variable name";
        }
        else if (col === 1) {
            return "Value";
        }
        return col + "?";
    }
    getClassName() {
        return "";
    }
    isCellEditable(row, col) {
        return true;
    }
    onValueChanged(row, col, value) {
        let property = this.properties[row];
        if (col === 0) {
            property.name = value;
        }
        else if (col === 1) {
            property.value = value;
        }
        this.fireModelChanged();
    }
    onEditValidation(row, col, value) {
        return {
            validationStatus: true,
            validationErrorMessage: "",
            showValidationError: false
        };
    }
    fireModelChanged() {
        this.events.emit("didModelChanged", this);
    }
    forceProperties(values) {
        this.properties = values;
        this.fireModelChanged();
    }
    destroy() {
        this.events.removeAllListeners();
        this.events = null;
    }
}
class TaskViewCliParamsRenderer extends UIBaseComponent {
    constructor() {
        super();
        this.events = new EventEmitter();
        this.initUI();
    }
    initUI() {
        this.initToolbar();
        this.initListView();
        this.mainElement = createElement('div', {
            elements: [this.toolbar, this.listView.element()],
            className: 'de-workbench-variants-ctrl-prop-renderer'
        });
    }
    initToolbar() {
        let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
        buttonGroup.addButton(new UIButtonConfig()
            .setId('add')
            .setCaption("+")
            .setClickListener(() => {
            this.model.addNewProperty();
        }));
        buttonGroup.addButton(new UIButtonConfig()
            .setId('add')
            .setCaption("-")
            .setClickListener(() => {
            this.removeSelectedRow();
        }));
        buttonGroup.element().classList.add('btn-group-xs');
        this.toolbar = createElement('div', {
            elements: [
                buttonGroup.element()
            ],
            className: 'de-workbench-variants-ctrl-toolbar'
        });
    }
    initListView() {
        this.model = this.buildModel([])
            .addEventListener('didModelChanged', () => {
            this.fireDataChanged();
        });
        this.listView = new UIExtendedListView(this.model);
    }
    removeSelectedRow() {
        let row = this.listView.getSelectedRow();
        this.model.removePropertyAt(row);
        this.events.emit("didPropertyRemoved");
    }
    updateUI(values) {
        Logger.consoleLog('update ui');
        this.model.forceValues(values);
    }
    buildModel(values) {
        return new CliParamsListViewModel(values);
    }
    fireDataChanged() {
        Logger.consoleLog('fireDataChanged');
        this.events.emit('didCliParamsDataChanged');
    }
}
class CliParamsListViewModel {
    constructor(values) {
        this.events = new EventEmitter();
        this.values = values != null ? values : [];
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
        return this;
    }
    addNewProperty() {
        this.values.push("--NewParams");
        this.fireModelChanged();
    }
    removePropertyAt(index) {
        if (index >= 0) {
            this.values.splice(index, 1);
            this.fireModelChanged();
        }
    }
    hasHeader() {
        return true;
    }
    getRowCount() {
        return this.values.length;
    }
    getColCount() {
        return 1;
    }
    getValueAt(row, col) {
        let property = this.values[row];
        return property;
    }
    getClassNameAt(row, col) {
        return "";
    }
    getColumnName(col) {
        if (col === 0) {
            return "Cli Args";
        }
        return col + "?";
    }
    getClassName() {
        return "";
    }
    isCellEditable(row, col) {
        return true;
    }
    onValueChanged(row, col, value) {
        let property = this.values[row];
        if (col === 0) {
            this.values[row] = value;
        }
        this.fireModelChanged();
    }
    onEditValidation(row, col, value) {
        let sValue = value;
        if (value.indexOf(' ') >= 0) {
            return {
                validationStatus: true,
                validationErrorMessage: "Space are not supported",
                showValidationError: true
            };
        }
        return {
            validationStatus: true,
            validationErrorMessage: "",
            showValidationError: false
        };
    }
    fireModelChanged() {
        this.events.emit("didModelChanged", this);
    }
    forceValues(values) {
        this.values = values;
        this.fireModelChanged();
    }
    destroy() {
        this.events.removeAllListeners();
        this.events = null;
    }
}
//# sourceMappingURL=TaskViewEnvironmentTab.js.map