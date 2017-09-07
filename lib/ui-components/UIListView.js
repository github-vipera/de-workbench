'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
const { CompositeDisposable } = require('atom');
export class UIListView extends UIBaseComponent {
    constructor(model) {
        super();
        this.subscriptions = new CompositeDisposable();
        if (model) {
            this.setModel(model);
        }
    }
    setModel(model) {
        this.model = model;
        this.buildUI();
        this.model.addEventListener('didModelChanged', () => {
            this.modelChanged();
        });
    }
    buildUI() {
        let listViewClass = "de-workbench-listview";
        let customClass = this.model.getClassName();
        if (customClass) {
            listViewClass += " " + customClass;
        }
        this.tableElement = this.createTableElement();
        this.mainElement = createElement('div', {
            elements: [
                this.tableElement
            ],
            className: listViewClass
        });
        this.mainElement.id = this.uiComponentId;
        this.tableReady(this.tableElement);
    }
    tableReady(table) {
        //overridable
    }
    createTableElement() {
        let table = createElement('table', {
            className: "de-workbench-listview-tb"
        });
        // create header if required
        if (this.model.hasHeader()) {
            let tbRow = createElement('tr', { className: 'de-workbench-listview-tb-header' });
            for (var c = 0; c < this.model.getColCount(); c++) {
                let tbCol = createElement('th', {
                    elements: [
                        createText(this.model.getColumnName(c))
                    ],
                    className: "de-workbench-listview-tb-header-col"
                });
                insertElement(tbRow, tbCol);
            }
            insertElement(table, tbRow);
        }
        // create rows
        for (var r = 0; r < this.model.getRowCount(); r++) {
            let tbRow = createElement('tr');
            for (var c = 0; c < this.model.getColCount(); c++) {
                let innerElement = undefined;
                if (typeof this.model.getElementAt == "function") {
                    innerElement = this.model.getElementAt(r, c);
                }
                else {
                    innerElement = createText(this.model.getValueAt(r, c));
                }
                let tdClassName = '';
                if (this.model.getClassNameAt) {
                    let v = this.model.getClassNameAt(r, c);
                    if (v) {
                        tdClassName = v;
                    }
                }
                let tbCol = createElement('td', {
                    elements: [
                        innerElement
                    ],
                    className: tdClassName
                });
                tbCol.setAttribute('row', r);
                tbCol.setAttribute('col', c);
                if (this.model.getTitleAt) {
                    let title = this.model.getTitleAt(r, c);
                    if (title && title.length > 0) {
                        this.subscriptions.add(atom["tooltips"].add(tbCol, {
                            title: title
                        }));
                    }
                }
                insertElement(tbRow, tbCol);
            }
            tbRow.setAttribute('trow', r);
            insertElement(table, tbRow);
        }
        return table;
    }
    modelChanged() {
        let oldTable = this.tableElement;
        this.tableElement = this.createTableElement();
        this.mainElement.replaceChild(this.tableElement, oldTable);
        this.tableReady(this.tableElement);
    }
    destroy() {
        this.model.destroy();
        this.tableElement.remove();
        this.subscriptions.dispose();
        super.destroy();
    }
}
//# sourceMappingURL=UIListView.js.map