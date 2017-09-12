'use babel';
import { createElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
export class UILineLoader extends UIBaseComponent {
    constructor() {
        super();
        this.onLoading = false;
        this.initUI();
    }
    initUI() {
        this.mainElement = createElement('div', {
            className: 'status-loading'
        });
    }
    setOnLoading(value) {
        //if(this.onLoading != value){
        this.onLoading = value;
        this.updateUI();
        //}
    }
    updateUI() {
        this.mainElement.classList[this.onLoading ? 'add' : 'remove']('active');
    }
}
//# sourceMappingURL=UILineLoader.js.map