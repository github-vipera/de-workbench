'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../../element/index';
import { UIPane } from '../../ui-components/UIPane';
import { Logger } from '../../logger/Logger';
export class ServersView extends UIPane {
    constructor(projectRoot) {
        super({
            title: "DE Servers",
            projectRoot: projectRoot,
            paneName: "DEServers",
            location: 'right'
        });
        Logger.getInstance().debug("PushToolView creating for ", this.projectRoot, this.projectId);
    }
    createUI() {
        let el = createElement('div', {
            elements: [
                createText("Servers View")
            ],
            className: 'de-workbench-servers-view'
        });
        return el;
    }
    destroy() {
        super.destroy();
    }
}
//# sourceMappingURL=BookmarksView.js.map