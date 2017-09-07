'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../../element/index';
import { ProjectManager } from '../../../DEWorkbench/ProjectManager';
import { UIStackedView } from '../../../ui-components/UIStackedView';
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { CommunityPluginsView } from './CommunityPluginsView';
import { ProvidedPluginsView } from './ProvidedPluginsView';
import { CordovaPluginsProvidersManager } from '../../../DEWorkbench/services/CordovaPluginsProvidersManager';
export class InstallNewPluginsView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
        let currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
        let cordova = ProjectManager.getInstance().cordova;
    }
    buildUI() {
        this.communityPluginsView = new CommunityPluginsView();
        this.tabbedView = new UITabbedView().setTabType(UITabbedViewTabType.Horizontal);
        //this.tabbedView.addView(new UITabbedViewItem('de_plugins',          'Dynamic Engine Plugins',  this.createSimpleEmptyView('Dynamic Engine Plugins List here')).setTitleClass('icon icon-settings'));
        //this.tabbedView.addView(new UITabbedViewItem('featured_plugins',    'Featured Plugins',  this.createSimpleEmptyView('Third Part Featured Plugins List here')).setTitleClass('icon icon-settings'));
        this.tabbedView.addView(new UITabbedViewItem('community_plugins', 'Community Plugins', this.communityPluginsView.element()).setTitleClass('icon icon-settings'));
        let externalPluginsProvidersFactories = CordovaPluginsProvidersManager.getInstance().getProviderFactories();
        console.log("externalPluginsProvidersFactrories ", externalPluginsProvidersFactories);
        for (var i = 0; i < externalPluginsProvidersFactories.length; i++) {
            let provider = externalPluginsProvidersFactories[i].createProvider();
            let providedPluginsView = new ProvidedPluginsView().setPluginsProvider(provider).reloadPluginList();
            this.tabbedView.addView(new UITabbedViewItem('de_provided_plugins_' + provider.getProviderName(), provider.getProviderName(), providedPluginsView.element()).setTitleClass('icon icon-settings'));
        }
        this.stackedPage = new UIStackedView({
            titleIconClass: 'icon-puzzle'
        })
            .setTitle('Install New Plugins')
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
    destroy() {
        this.communityPluginsView.destroy();
        this.stackedPage.destroy();
        this.tabbedView.destroy();
        super.destroy();
    }
}
//# sourceMappingURL=InstallNewPluginsView.js.map