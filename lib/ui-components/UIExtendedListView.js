'use babel';
import { createText, createElement, insertElement, createTextEditor } from '../element/index';
import { UIListView } from './UIListView';
const remote = require('remote');
const $ = require("jquery");
export class UIExtendedListView extends UIListView {
    constructor(model) {
        super(model);
        this.cellSelectable = true;
        this.extendedModel = model;
        this.extendedModel.addEventListener('didModelChanged', () => {
            this.modelChanged();
        });
    }
    buildUI() {
        super.buildUI();
        this.editorEl = this.createEditor();
        insertElement(this.mainElement, this.editorEl);
        this.validationErrorOverlay = this.createValidationErrorOverlay();
        insertElement(this.mainElement, this.validationErrorOverlay);
    }
    createEditor() {
        let editorEl = createTextEditor({});
        editorEl.style.position = "absolute";
        editorEl.style.visibility = "hidden";
        editorEl.classList.add("de-workbench-listview-tb-editor");
        editorEl.classList.add("nativenative-key-bindings");
        editorEl.addEventListener('keydown', (evt) => {
            if (evt.keyCode === 13) {
                this.commitEditing();
            }
            if (evt.keyCode === 27) {
                this.cancelEditing();
            }
        });
        return editorEl;
    }
    createValidationErrorOverlay() {
        let el = createElement('div', {
            elements: [
                createText("Validation Error")
            ],
            className: 'de-workbench-listview-tb-editor-validation-error'
        });
        el.style.position = "absolute";
        el.style.visibility = "hidden";
        return el;
    }
    tableReady(table) {
        super.tableReady(table);
        if (!table.getAttribute("tabindex")) {
            table.setAttribute("tabindex", "0");
        }
        $(table).on('click', (evt) => {
            evt.preventDefault();
            if (this.isEditing()) {
                if (this.commitEditing()) {
                    this.selectCell(evt.target);
                }
            }
            else {
                this.selectCell(evt.target);
            }
        });
        $(table).on('dblclick', (evt) => {
            evt.preventDefault();
            this.selectCell(evt.target);
            this.manageCellEdit(this.selectedCell);
        });
        window.addEventListener('resize', () => {
            if (this.isEditing()) {
                this.moveEditor(this.selectedCell);
            }
        });
        $(table).keydown((evt) => {
            this.navigateTableWithKeyboard(evt.which);
        });
        $(table).focusout(() => {
            this.removeCurrentSelection();
        });
    }
    navigateTableWithKeyboard(key) {
        console.log("navigateTableWithKeyboard ", key);
        if (key == 39) {
            this.navigateRight();
        }
        else if (key == 37) {
            this.navigateLeft();
        }
        else if (key == 38) {
            this.navigateUp();
        }
        else if (key == 40) {
            this.navigateDown();
        }
        else if (key == 13) {
            this.manageCellEdit(this.selectedCell);
        }
        else if (key == 27) {
            if (this.isEditing()) {
                this.cancelEditing();
            }
        }
    }
    navigateRight() {
        console.log("Navigate right");
        if (!this.selectedCell) {
            return;
        }
        let c = $(this.selectedCell).next();
        if (c && c[0]) {
            this.selectCell(c[0]);
        }
    }
    navigateLeft() {
        console.log("Navigate left");
        if (!this.selectedCell) {
            return;
        }
        let c = $(this.selectedCell).prev();
        if (c && c[0]) {
            this.selectCell(c[0]);
        }
    }
    navigateDown() {
        console.log("Navigate down");
        if (!this.selectedCell) {
            return;
        }
        let c = $(this.selectedCell).closest('tr').next().find('td:eq(' + $(this.selectedCell).index() + ')');
        if (c && c[0]) {
            this.selectCell(c[0]);
        }
    }
    navigateUp() {
        console.log("Navigate up");
        if (!this.selectedCell) {
            return;
        }
        let c = $(this.selectedCell).closest('tr').prev().find('td:eq(' + $(this.selectedCell).index() + ')');
        if (c && c[0]) {
            this.selectCell(c[0]);
        }
    }
    removeCurrentSelection() {
        if (this.selectedCell) {
            this.selectedCell.classList.remove("selected");
        }
    }
    selectCell(cell) {
        if (this.cellSelectable) {
            this.removeCurrentSelection();
            cell.classList.add("selected");
            this.selectedCell = cell;
            let row = this.getSelectedRow();
            if (row > -1) {
                this.selectRow(row);
            }
        }
    }
    selectRow(row) {
        if (this.selectedRow) {
            this.selectedRow.classList.remove("selected");
        }
        let elements = $(this.tableElement).find("[trow=" + row + "]");
        if (elements && elements.length == 1) {
            let rowEl = elements[0];
            console.log("Row element: ", rowEl);
            rowEl.classList.add("selected");
            this.selectedRow = rowEl;
        }
    }
    getSelectedRow() {
        if (this.selectedCell) {
            let row = this.selectedCell.getAttribute('row');
            return parseInt(row);
        }
        else {
            return -1;
        }
    }
    getSelectedColumn() {
        if (this.selectedCell) {
            let col = this.selectedCell.getAttribute('col');
            return parseInt(col);
        }
        else {
            return -1;
        }
    }
    manageCellEdit(cell) {
        let row = this.getSelectedRow();
        let col = this.getSelectedColumn();
        if (this.extendedModel.isCellEditable(row, col)) {
            this.startEditing(row, col, cell);
        }
    }
    startEditing(row, col, cell) {
        this.prepareEditor(row, col, cell);
        this.editorEl.style.visibility = "visible";
        this.editorEl.focus();
        this.editing = true;
        $(this.editorEl).focusout(() => {
            this.commitEditing();
        });
    }
    prepareEditor(row, col, cell) {
        this.moveEditor(cell);
        this.editorEl['getModel']().setText(cell.innerText);
        this.editorEl['getModel']().selectAll();
        return this.editorEl;
    }
    moveEditor(cell) {
        let width = cell.offsetWidth - 2;
        let height = cell.offsetHeight - 2;
        this.editorEl.style.width = width + "px";
        this.editorEl.style.height = height + "px";
        let offset = $(cell).offset();
        offset.top += 1;
        offset.left += 1;
        $(this.editorEl).offset(offset);
        $(this.validationErrorOverlay).offset({
            top: (offset.top - 19),
            left: (offset.left - 2)
        });
        this.validationErrorOverlay.style.width = (width - 40) + "px";
    }
    commitEditing() {
        console.log('commit!');
        let value = this.editorEl["getModel"]().getText();
        let row = this.getSelectedRow();
        let col = this.getSelectedColumn();
        let validationResult = this.extendedModel.onEditValidation(row, col, value);
        if (!validationResult.validationStatus) {
            if (validationResult.showValidationError) {
                this.showValidationError(validationResult.validationErrorMessage);
            }
            return false;
        }
        this.editorEl.style.visibility = "hidden";
        $(this.editorEl).off('focusout');
        this.editing = false;
        this.extendedModel.onValueChanged(row, col, value);
        this.tableElement.focus();
        return true;
    }
    cancelEditing() {
        console.log('cancel!');
        this.hideValidationError();
        this.editorEl.style.visibility = "hidden";
        $(this.editorEl).off('focusout');
        this.editing = false;
        this.tableElement.focus();
    }
    isEditing() {
        return this.editing;
    }
    showValidationError(errorMessage) {
        this.validationErrorOverlay.innerText = errorMessage;
        this.validationErrorOverlay.style.visibility = "visible";
        this.selectedCell.classList.add("validation-error");
    }
    hideValidationError() {
        this.validationErrorOverlay.style.visibility = "hidden";
        this.selectedCell.classList.remove("validation-error");
    }
    isCellSelectable() {
        return this.cellSelectable;
    }
    setCellSelectable(value) {
        this.cellSelectable = value;
        return this;
    }
}
//# sourceMappingURL=UIExtendedListView.js.map