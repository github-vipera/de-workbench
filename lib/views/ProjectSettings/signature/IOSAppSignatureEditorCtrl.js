'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UIInputFormElement, UISelectFormElement } from '../../../ui-components/UIInputFormElement';
import { AbstractAppSignatureEditorCtrl } from './AbstractAppSignatureEditorCtrl';
const _ = require('lodash');
export class IOSAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {
    constructor(appType) {
        super(appType);
    }
    createControls() {
        this.devTeamInput = new UIInputFormElement().setCaption('Development Team').setPlaceholder('Development Team').addEventListener('change', (evtCtrl) => {
        });
        this.codeSignIdentityInput = new UIInputFormElement().setCaption('Code Sign Identity').setPlaceholder('Code Sign Identity').addEventListener('change', (evtCtrl) => {
        });
        this.provisioningProfileSelect = new UISelectFormElement().setCaption('Provisioning Profile');
        this.provisioningProfileSelect.getSelectCtrl().addSelectListener(this);
        this.packageTypeSelect = new UISelectFormElement().setCaption('Package Type');
        this.packageTypeSelect.setItems(this.getPackageTypeItems());
        return [this.provisioningProfileSelect.element(), this.devTeamInput.element(), this.codeSignIdentityInput.element(), this.packageTypeSelect.element()];
    }
    onItemSelected(value) {
        let provisioningProfile = this.getProvisioningProfileByAppId(value);
        this.devTeamInput.setValue(provisioningProfile.teamName);
    }
    getProvisioningProfileByAppId(appId) {
        return this.provisioningProfiles[appId];
    }
    getPackageTypeItems() {
        return [
            { value: "developement",
                name: "Developement"
            },
            { value: "adhoc",
                name: "Ad-Hoc"
            },
            { value: "enterprise",
                name: "Enterprise"
            },
            { value: "appstore",
                name: "AppStore"
            }
        ];
    }
    destroy() {
        this.provisioningProfileSelect.destroy();
        this.packageTypeSelect.destroy();
        this.devTeamInput.destroy();
        this.codeSignIdentityInput.destroy();
        super.destroy();
    }
    reloadProvisioningProfiles(provisioningProfiles) {
        let currentProvisioningSelected = this.provisioningProfileSelect.getValue();
        this.provisioningProfiles = provisioningProfiles;
        let items = this.createItems(provisioningProfiles);
        this.provisioningProfileSelect.setItems(items);
        this.refreshProvisioningSelected(currentProvisioningSelected);
    }
    refreshProvisioningSelected(toSelect) {
        if (toSelect) {
            this.provisioningProfileSelect.setValue(toSelect);
        }
        else {
            let json = this.getBuildJsonsection('ios');
            if (json) {
                this.provisioningProfileSelect.setValue(json.provisioningProfile);
            }
        }
    }
    createItems(provisioningProfiles) {
        return _.map(provisioningProfiles, (item) => {
            return {
                name: item.appId,
                value: item.appIdentifier,
                userData: item
            };
        });
    }
    updateUI(buildJson) {
        let json = this.getBuildJsonsection('ios');
        if (json) {
            this.provisioningProfileSelect.setValue(json.provisioningProfile);
            this.codeSignIdentityInput.setValue(json.codeSignIdentity);
            this.devTeamInput.setValue(json.developmentTeam);
            this.packageTypeSelect.setValue(json.packageType);
        }
    }
    saveChanges() {
        let json = this.getBuildJsonsection('ios');
        if (json) {
            json.provisioningProfile = this.provisioningProfileSelect.getValue();
            json.codeSignIdentity = this.codeSignIdentityInput.getValue();
            json.developmentTeam = this.devTeamInput.getValue();
            json.packageType = this.packageTypeSelect.getValue();
        }
    }
    reload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.updateUI(this.buildJson);
        });
    }
}
//# sourceMappingURL=IOSAppSignatureEditorCtrl.js.map