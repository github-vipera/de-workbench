'use babel';
import { createText, createElement, insertElement } from '../element/index';
import { UIBaseComponent } from './UIComponent';
export class UIStackedView extends UIBaseComponent {
    constructor(options) {
        super();
        this.options = options;
        this.buildUI();
    }
    buildUI() {
        this.titleElement = createText('');
        let titleIconClassName = 'icon ';
        if (this.options && this.options.titleIconClass) {
            titleIconClassName = titleIconClassName + " " + this.options.titleIconClass;
        }
        this.titleIcon = createElement('a', {
            className: titleIconClassName
        });
        this.headerElement = createElement('div', {
            elements: [
                this.titleIcon,
                this.titleElement
            ],
            className: "de-workbench-stacked-view-header-section section-heading"
        });
        if (this.options && this.options.subtle) {
            let subtleEl = createElement('div', {
                elements: [
                    createText(this.options.subtle)
                ],
                className: "de-workbench-stacked-view-header-section section-heading-subtle text-subtle text-smaller"
            });
            insertElement(this.headerElement, subtleEl);
        }
        this.mainElement = createElement('div', {
            elements: [
                this.headerElement
            ],
            className: "de-workbench-stacked-view"
        });
    }
    addHeaderClassName(className) {
        this.headerElement.classList.add(className);
        return this;
    }
    setIconClassName(className) {
        this.iconClassName = className;
        return this;
    }
    setTitle(title) {
        this.title = title;
        this.titleElement.textContent = title;
        return this;
    }
    setInnerView(view) {
        this.innerView = view;
        insertElement(this.mainElement, view);
        return this;
    }
    setSubtleView(view) {
        this.subtleView = view;
        return this;
    }
    destroy() {
        super.destroy();
    }
}
//# sourceMappingURL=UIStackedView.js.map