'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createElement } from '../../../element/index';
import { UIInputFormElement, UISelectFormElement } from '../../../ui-components/UIInputFormElement';
import { AbstractAppSignatureEditorCtrl } from './AbstractAppSignatureEditorCtrl';
import { UIButtonMenu } from '../../../ui-components/UIButtonMenu';
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
        this.provisioningProfileInput = new UIInputFormElement().setCaption('Provisioning Profile ID').setPlaceholder('Provisioning Profile ID').addEventListener('change', (evtCtrl) => {
        }).setExtClassName('control-group-with-button');
        this.btnProvisioningProfilesSelector = new UIButtonMenu()
            .setCaption('Select from list...')
            .setInfoMessage('Select a Provisioning Profile')
            .setEmptyMessage('  NOTE: Loading Provisioning Profiles...')
            .setOnSelectionListener((menuItem) => {
            this.provisioningProfileInput.setValue(menuItem.value);
            this.devTeamInput.setValue(menuItem.userData.teamIdentifier[0]);
        });
        let btnProvisioningProfilesSelectorDiv = createElement('div', {
            elements: [
                this.btnProvisioningProfilesSelector.element()
            ],
            className: 'select-provisioning-profile-ctrl'
        });
        this.btnProvisioningProfilesSelector.setMenuItems([]);
        this.provisioningProfileInput.element().appendChild(btnProvisioningProfilesSelectorDiv);
        this.packageTypeSelect = new UISelectFormElement().setCaption('Package Type');
        this.packageTypeSelect.setItems(this.getPackageTypeItems());
        return [this.provisioningProfileInput.element(), this.devTeamInput.element(), this.codeSignIdentityInput.element(), this.packageTypeSelect.element()];
    }
    onItemSelected(value) {
        let provisioningProfile = this.getprovisionigProfileByUUID(value);
        this.devTeamInput.setValue(provisioningProfile.teamIdentifier[0]);
        this.devTeamInput.setCaption("Development Team [" + provisioningProfile.teamName + "]");
    }
    getprovisionigProfileByUUID(uuid) {
        return _.find(this.provisioningProfiles, (obj) => {
            return obj.data.UUID === uuid;
        });
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
        this.packageTypeSelect.destroy();
        this.devTeamInput.destroy();
        this.codeSignIdentityInput.destroy();
        super.destroy();
    }
    reloadProvisioningProfiles(provisioningProfiles) {
        this.btnProvisioningProfilesSelector.setEmptyMessage("  NOTE: No provisioning profiles found");
        let values = _.map(provisioningProfiles, (profile) => {
            return {
                displayName: profile.data.AppIDName,
                value: profile.data.UUID,
                userData: profile
            };
        });
        var sortedValues = _.sortBy(values, (item) => {
            return item.displayName;
        });
        this.btnProvisioningProfilesSelector.setMenuItems(sortedValues);
    }
    refreshProvisioningSelected(toSelect) {
        alert("TODO!! refreshProvisioningSelected");
        if (toSelect) {
        }
        else {
            let json = this.getBuildJsonsection('ios');
            if (json) {
            }
        }
    }
    createItems(provisioningProfiles) {
        let ret = _.map(provisioningProfiles, (item) => {
            return {
                name: item.data.AppIDName,
                value: item.data.UUID,
                userData: item
            };
        });
        var sortedCollection = _.sortBy(ret, (item) => {
            return item.name;
        });
        return sortedCollection;
    }
    updateUI(buildJson) {
        let json = this.getBuildJsonsection('ios');
        if (json) {
            this.provisioningProfileInput.setValue(json.provisioningProfile);
            this.codeSignIdentityInput.setValue(json.codeSignIdentity);
            this.devTeamInput.setValue(json.developmentTeam);
            this.packageTypeSelect.setValue(json.packageType);
        }
    }
    saveChanges() {
        let json = this.getBuildJsonsection('ios');
        if (json) {
            json.provisioningProfile = this.provisioningProfileInput.getValue();
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