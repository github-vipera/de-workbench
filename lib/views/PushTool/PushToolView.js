'use babel';
import { createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
import { Logger } from '../../logger/Logger';
import { UITabbedView, UITabbedViewItem } from '../../ui-components/UITabbedView';
import { SendPushView } from './SendPushView';
import { PushSettingsView } from './PushSettingsView';
export class PushToolView extends UIPane {
    constructor(params) {
        super(params);
        Logger.getInstance().debug("PushToolsView creating for ", this.paneId);
    }
    createUI() {
        this.sendPushView = new SendPushView(this.options.userData.projectRoot);
        this.pushSettingsView = new PushSettingsView(this.options.userData.projectRoot);
        this.tabbedView = new UITabbedView();
        this.tabbedView.addView(new UITabbedViewItem('sendPush', 'Send Push', this.sendPushView.element()).setTitleClass('icon icon-comment'));
        this.tabbedView.addView(new UITabbedViewItem('pushSettings', 'Push Settings', this.pushSettingsView.element()).setTitleClass('icon icon-gear'));
        let el = createElement('div', {
            elements: [
                this.tabbedView.element()
            ],
            className: 'de-workbench-project-settings-view'
        });
        return el;
    }
    destroy() {
        this.sendPushView.destroy();
        this.pushSettingsView.destroy();
        this.tabbedView.destroy();
        super.destroy();
    }
}
//# sourceMappingURL=PushToolView.js.map