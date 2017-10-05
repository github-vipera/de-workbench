'use babel';
import { createElement } from '../../../element/index';
import { UIExtendedListView } from '../../../ui-components/UIExtendedListView';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { UITreeView, findItemInTreeModel } from '../../../ui-components/UITreeView';
import { UIButtonGroupMode, UIButtonConfig, UIButtonGroup } from '../../../ui-components/UIButtonGroup';
import { EventEmitter } from 'events';
import { VariantPreference } from '../../../DEWorkbench/VariantsManager';
export class VariantsGridCtrl extends UIBaseComponent {
    constructor(variant) {
        super();
        this.variant = variant;
        this.events = new EventEmitter();
        this.initUI();
    }
    initUI() {
        this.treeModel = this.createTreeModel();
        this.treeView = new UITreeView(this.treeModel);
        this.mainElement = this.treeView.element();
        this.mainElement.classList.add("de-workbench-variants-treeview");
        this.treeModel.addEventListener('didModelChanged', () => {
            this.events.emit('didDataChanged', this);
        });
    }
    createTreeModel() {
        let globalPropertiesNode = new VariantsPlatformTreeItem('global', 'Global Properties', this.variant);
        let androidPropertiesNode = new VariantsPlatformTreeItem('android', 'Android Properties', this.variant);
        let iosPropertiesNode = new VariantsPlatformTreeItem('ios', 'iOS Properties', this.variant);
        let browserPropertiesNode = new VariantsPlatformTreeItem('browser', 'Browser Properties', this.variant);
        let rootNode = new VariantsTreeItem('_root', 'Configuration Properties', this.variant)
            .setChildren([globalPropertiesNode, androidPropertiesNode, iosPropertiesNode, browserPropertiesNode]);
        let newModel = new VariantTreeModel(this.variant).setRoot(rootNode);
        return newModel;
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
        return this;
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
        return this;
    }
    destroy() {
        super.destroy();
        this.events.removeAllListeners();
        this.treeView.destroy();
        this.treeModel.destroy();
        this.treeView = null;
        this.treeModel = null;
        this.events = null;
    }
}
export class VariantTreeModel {
    constructor(variant) {
        this.variant = variant;
    }
    setRoot(root) {
        this.root = root;
        this.subscribeForItemEvents(root);
        this.events = new EventEmitter();
        return this;
    }
    subscribeForItemEvents(treeItem) {
        treeItem.addEventListener('didItemChanged', () => {
            this.fireModelChanged();
        });
        if (treeItem.children) {
            for (var i = 0; i < treeItem.children.length; i++) {
                this.subscribeForItemEvents(treeItem.children[i]);
            }
        }
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
    fireModelChanged() {
        this.events.emit("didModelChanged");
    }
    destroy() {
        this.events.removeAllListeners();
        this.root.destroy();
        this.root = null;
        this.events = null;
    }
}
export class VariantsTreeItem {
    constructor(id, name, variant) {
        this.htmlElement = undefined;
        this.expanded = true;
        this.variant = variant;
        this.id = id;
        this.name = name;
        this.events = new EventEmitter();
    }
    setChildren(children) {
        this.children = children;
        return this;
    }
    fireItemChanged() {
        this.events.emit("didItemChanged");
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    destroy() {
        for (var i = 0; i < this.children.length; i++) {
            this.children[i].destroy();
        }
        this.children = undefined;
    }
}
export class VariantsPlatformTreeItem extends VariantsTreeItem {
    constructor(platformName, displayName, variant) {
        super(platformName, displayName, variant);
        this.platformName = platformName;
        this.createChildrenForProperties();
    }
    createChildrenForProperties() {
        this.propertyRenderer = new VariantsPropertyRenderer(this.platformName, this.variant);
        this.propertyRenderer.addEventListener('didDataChanged', () => {
            this.fireItemChanged();
        });
        let propertyListChild = new VariantsTreeItem(this.id + "_properties", this.id + "_properties", this.variant);
        propertyListChild.htmlElement = this.propertyRenderer.element();
        this.children = [propertyListChild];
    }
    destroy() {
        this.events.removeAllListeners();
        this.propertyRenderer.destroy();
        this.events = null;
        super.destroy();
    }
}
class VariantsPropertyRenderer extends UIBaseComponent {
    constructor(platformName, variant) {
        super();
        this.variant = variant;
        this.platformName = platformName;
        this.events = new EventEmitter();
        this.initUI();
    }
    initUI() {
        let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
        buttonGroup.addButton(new UIButtonConfig()
            .setId('add')
            .setCaption("+")
            .setClickListener(() => {
            this.addNewRow();
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
        this.model = new VariantsPlatformListViewModel(this.platformName, this.variant)
            .addEventListener('didModelChanged', () => {
            this.fireDataChanged();
        });
        this.listView = new UIExtendedListView(this.model);
        this.mainElement = createElement('div', {
            elements: [this.toolbar, this.listView.element()],
            className: 'de-workbench-variants-ctrl-prop-renderer'
        });
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        this.events.removeListener(event, listener);
    }
    addNewRow() {
        this.model.addNewProperty();
        this.events.emit("didPropertyAdded");
    }
    removeSelectedRow() {
        let row = this.listView.getSelectedRow();
        this.model.removePropertyAt(row);
        this.events.emit("didPropertyRemoved");
    }
    fireDataChanged() {
        this.events.emit("didDataChanged");
    }
    destroy() {
        this.events.removeAllListeners();
        this.listView.destroy();
        this.toolbar.remove();
        this.toolbar = null;
        this.model.destroy();
        this.model = null;
        super.destroy();
    }
}
class VariantsPlatformListViewModel {
    constructor(platformName, variant) {
        this.variant = variant;
        this.platformName = platformName;
        if (platformName === 'global') {
            this.properties = variant.preferences;
        }
        else {
            this.properties = variant.getOrCreatePlatformByName(this.platformName).preferences;
        }
        this.events = new EventEmitter();
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
        this.properties.push(new VariantPreference("New Property Name", "New Property Value"));
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
            return "Property";
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
    destroy() {
        this.events.removeAllListeners();
        this.events = null;
    }
}
//# sourceMappingURL=VariantsGridCtrl.js.map