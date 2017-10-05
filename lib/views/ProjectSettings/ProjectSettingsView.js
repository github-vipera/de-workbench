'use babel';
import { createElement, insertElement } from '../../element/index';
import { Logger } from '../../logger/Logger';
import { UITabbedView, UITabbedViewItem } from '../../ui-components/UITabbedView';
import { InstalledPluginsView } from './plugins/InstalledPluginsView';
import { InstallNewPluginsView } from './plugins/InstallNewPluginsView';
import { VariantsView } from './variants/VariantsView';
import { AppSignatureView } from './signature/AppSignatureView';
import { GeneralSettingsView } from './GeneralSettingsView';
import { UIPane } from '../../ui-components/UIPane';
const crypto = require('crypto');
export class ProjectSettingsView extends UIPane {
    constructor(params) {
        super(params);
        Logger.getInstance().debug("PushToolsView creating for ", this.paneId);
    }
    reloadProjectSettings() {
    }
    createUI() {
        Logger.getInstance().debug("ProjectSettingsView initUI called.");
        this.installedPluginsView = new InstalledPluginsView();
        this.installNewPluginsView = new InstallNewPluginsView();
        this.variantsView = new VariantsView();
        this.appSignatureView = new AppSignatureView();
        this.generalSettingsView = new GeneralSettingsView();
        let element = document.createElement('de-workbench-project-settings');
        this.tabbedView = new UITabbedView();
        this.tabbedView.addView(new UITabbedViewItem('general', 'General', this.generalSettingsView.element()).setTitleClass('icon icon-settings'));
        this.tabbedView.addView(new UITabbedViewItem('installed_plugins', 'Installed Plugins', this.installedPluginsView.element()).setTitleClass('icon icon-plug'));
        this.tabbedView.addView(new UITabbedViewItem('install_plugins', 'Install New Plugins', this.installNewPluginsView.element()).setTitleClass('icon icon-puzzle'));
        this.tabbedView.addView(new UITabbedViewItem('variants', 'Build Variants', this.variantsView.element()).setTitleClass('icon icon-versions'));
        this.tabbedView.addView(new UITabbedViewItem('app_signature', 'App Signature', this.appSignatureView.element()).setTitleClass('icon icon-shield'));
        let el = createElement('div', {
            elements: [
                this.tabbedView.element()
            ],
            className: 'de-workbench-project-settings-view'
        });
        insertElement(element, el);
        return element;
    }
    destroy() {
        this.generalSettingsView.destroy();
        this.installedPluginsView.destroy();
        this.installNewPluginsView.destroy();
        this.variantsView.destroy();
        this.appSignatureView.destroy();
        this.tabbedView.destroy();
        this.element.remove();
    }
}
//# sourceMappingURL=ProjectSettingsView.js.map