'use babel';
import { createText, createElement } from '../../element/index';
import { UIStackedView } from '../../ui-components/UIStackedView';
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { AppInfoView } from './AppInfoView';
import { InstalledPlatformsView } from './InstalledPlatformsView';
export class GeneralSettingsView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.appInfoView = new AppInfoView();
        this.installedPlatformsView = new InstalledPlatformsView();
        this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
        this.tabbedView.addView(new UITabbedViewItem('app_info', 'App Info', this.appInfoView.element()).setTitleClass('icon icon-settings'));
        this.tabbedView.addView(new UITabbedViewItem('installed_platforms', 'Installed Platforms', this.installedPlatformsView.element()).setTitleClass('icon icon-settings'));
        this.stackedPage = new UIStackedView({
            titleIconClass: 'icon-settings'
        })
            .setTitle('General Settings')
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
//# sourceMappingURL=GeneralSettingsView.js.map