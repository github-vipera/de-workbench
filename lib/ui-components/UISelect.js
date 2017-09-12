'use babel';
import { createSelect, createOption } from '../element/index';
import { UIBaseComponent } from './UIComponent';
import * as _ from 'lodash';
export class UISelect extends UIBaseComponent {
    constructor(items) {
        super();
        this.listeners = [];
        this.items = items || [];
        this.updateUI();
    }
    updateUI() {
        let options = this.createOptions(this.items);
        if (!this.mainElement) {
            this.mainElement = createSelect(options);
            this.mainElement.addEventListener('change', this.onChange.bind(this), false);
        }
        else {
            let el;
            while ((el = this.mainElement.firstChild) != null) {
                this.mainElement.removeChild(el);
            }
            options.forEach((item) => {
                this.mainElement.appendChild(item);
            });
        }
    }
    onChange(evt) {
        _.forEach(this.listeners, (single) => {
            single.onItemSelected(this.mainElement['value']);
        });
    }
    getItems() {
        return this.items;
    }
    setItems(items) {
        this.items = items;
        this.updateUI();
    }
    addSelectListener(listener) {
        this.listeners.push(listener);
    }
    removeSelectListener(listener) {
        this.listeners = _.remove(this.listeners, function (item) {
            return item == listener;
        });
    }
    createOptions(items) {
        let options = [];
        items.forEach((item) => {
            options.push(createOption(item.name, item.value));
        });
        return options;
    }
    setSelectedItem(value) {
        this.mainElement['value'] = value;
    }
    getSelectedItem() {
        return this.mainElement['value'];
    }
    resetSelection() {
        this.mainElement['selectedIndex'] = -1;
    }
    setEnable(value) {
        if (!value) {
            this.mainElement.setAttribute('disabled', 'true');
        }
        else {
            this.mainElement.removeAttribute('disabled');
        }
    }
}
//# sourceMappingURL=UISelect.js.map