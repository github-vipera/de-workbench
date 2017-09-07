'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UIInputFormElement, UIInputBrowseForFolderFormElement } from '../../../ui-components/UIInputFormElement';
import { AbstractAppSignatureEditorCtrl } from './AbstractAppSignatureEditorCtrl';
export class AndroidAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {
    constructor(appType) {
        super(appType);
    }
    createControls() {
        this.passwd = new UIInputFormElement({ password: true }).setCaption('Password (keypass)').setPlaceholder('Password (keypass)').addEventListener('change', (evtCtrl) => {
        });
        this.alias = new UIInputFormElement().setCaption('Alias').setPlaceholder('Alias').addEventListener('change', (evtCtrl) => {
        }).chainTo(this.passwd.toChain());
        this.storePasswd = new UIInputFormElement({ password: true }).setCaption('Store Password (storepass)').setPlaceholder('Store Password (storepass)').addEventListener('change', (evtCtrl) => {
        }).chainTo(this.alias.toChain());
        this.keystorePath = new UIInputBrowseForFolderFormElement().setCaption('Keystore Path').setPlaceholder('Keystore Path').chainTo(this.storePasswd.toChain());
        this.passwd.chainTo(this.keystorePath.toChain());
        return [this.keystorePath.element(), this.storePasswd.element(), this.alias.element(), this.passwd.element()];
    }
    destroy() {
        this.keystorePath.destroy();
        this.storePasswd.destroy();
        this.alias.destroy();
        this.passwd.destroy();
        super.destroy();
    }
    updateUI(buildJson) {
        let json = this.getBuildJsonsection('android');
        if (json) {
            this.keystorePath.setValue(json.keystore);
            this.storePasswd.setValue(json.storePassword);
            this.alias.setValue(json.alias);
            this.passwd.setValue(json.password);
        }
    }
    saveChanges() {
        let json = this.getBuildJsonsection('android');
        if (json) {
            json.keystore = this.keystorePath.getValue();
            json.storePassword = this.storePasswd.getValue();
            json.alias = this.alias.getValue();
            json.password = this.passwd.getValue();
            json.keystoreType = "";
        }
    }
    reload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateUI(this.buildJson);
        });
    }
}
//# sourceMappingURL=AndroidAppSignatureEditorCtrl.js.map