'use babel';
import { createText, createElement, createButton, createIcon } from '../element/index';
import { UIBaseComponent } from './UIComponent';
import { find } from 'lodash';
export class UISelectButton extends UIBaseComponent {
    constructor(select, emptyText, options) {
        super();
        this.select = select;
        this.emptyText = emptyText;
        this.selectedItem = null;
        this.uiOptions = options || {};
        this.select.addSelectListener(this);
        this.initUI();
    }
    initUI() {
        this.txtSelected = createText(this.emptyText);
        let elements = [
            this.txtSelected,
            this.select.element(),
        ];
        if (this.uiOptions.withArrow) {
            elements[elements.length] = createElement('div', {
                className: 'bugs-scheme-arrow'
            });
        }
        if (this.uiOptions.rightIcon) {
            elements[elements.length] = createIcon(this.uiOptions.rightIcon);
        }
        this.mainElement = createButton({
            className: "select-btn"
        }, elements);
    }
    setSelectedItem(value) {
        this.selectedItem = find(this.select.getItems(), (item) => {
            return item.value == value;
        });
        if (!this.selectedItem) {
            this.txtSelected.textContent = this.emptyText;
            this.selectedItem = null;
            return;
        }
        this.txtSelected.textContent = this.selectedItem.name;
        this.select.setSelectedItem(this.selectedItem.value);
    }
    resetSelection() {
        this.select.resetSelection();
        this.txtSelected.textContent = this.emptyText;
    }
    onItemSelected(value) {
        //this.txtSelected.textContent = value;
        this.selectedItem = find(this.select.getItems(), (item) => {
            return item.value == value;
        });
        if (!this.selectedItem) {
            this.txtSelected.textContent = this.emptyText;
            return;
        }
        this.txtSelected.textContent = this.selectedItem.name;
    }
}
//# sourceMappingURL=UISelectButton.js.map