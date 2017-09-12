'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../element/index';
import { UIStackedView } from '../../ui-components/UIStackedView';
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView';
import { UIBaseComponent } from '../../ui-components/UIComponent';
export class AppSignatureView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
        this.tabbedView.addView(new UITabbedViewItem('ios', 'iOS', this.createSimpleEmptyView('iOS App Signing here')).setTitleClass('icon icon-settings'));
        this.tabbedView.addView(new UITabbedViewItem('android', 'Android', this.createSimpleEmptyView('Android App Signing here')).setTitleClass('icon icon-settings'));
        this.stackedPage = new UIStackedView()
            .setTitle('App Signature')
            .setInnerView(this.tabbedView.element())
            .addHeaderClassName('de-workbench-stacked-view-header-section-thin');
        this.mainElement = this.stackedPage.element();
    }
    createSimpleEmptyView(color) {
        let el = createElement('div', {
            elements: [
                createText(color)
            ]
        });
        el.style["background-color"] = 'transparent';
        el.style["width"] = "100%";
        el.style["heightz"] = "100%";
        return el;
    }
}
//# sourceMappingURL=AppSignatureView.js.map