'use babel';
import { createText, createElement } from '../../../element/index';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
export var AppType;
(function (AppType) {
    AppType[AppType["Debug"] = 1] = "Debug";
    AppType[AppType["Release"] = 2] = "Release";
})(AppType || (AppType = {}));
export class AbstractAppSignatureEditorCtrl extends UIBaseComponent {
    constructor(appType) {
        super();
        this.appType = appType;
        this.initUI();
    }
    initUI() {
        let controls = this.createControls();
        let sectionContainer = createElement('div', {
            elements: [controls],
            className: 'section-container'
        });
        let mainSection = createElement('div', {
            elements: [sectionContainer],
            className: 'section de-wb-signature-editor-crtl-container'
        });
        this.mainElement = mainSection;
    }
    getApptype() {
        return this.appType;
    }
    createBlock(title, element) {
        let block = createElement('div', {
            elements: [
                createElement('label', {
                    elements: [createText(title)]
                }),
                element
            ],
            className: 'block control-group'
        });
        return block;
    }
    destroy() {
        super.destroy();
    }
    createControls() {
        return [];
    }
    reload() {
        throw 'Not implemented';
    }
    saveChanges() {
        throw 'Not implemented';
    }
    setBuildJson(buildJson) {
        this.buildJson = buildJson;
        this.updateUI(buildJson);
    }
    updateUI(buildJson) {
        throw 'Not implemented';
    }
    getBuildJsonsection(platform) {
        let json = null;
        if (this.appType === AppType.Debug) {
            if (this.buildJson[platform] && this.buildJson[platform].debug) {
                json = this.buildJson[platform].debug;
            }
        }
        else if (this.appType === AppType.Release) {
            if (this.buildJson[platform] && this.buildJson[platform].release) {
                json = this.buildJson[platform].release;
            }
        }
        return json;
    }
}
//# sourceMappingURL=AbstractAppSignatureEditorCtrl.js.map