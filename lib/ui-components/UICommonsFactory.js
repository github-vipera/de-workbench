'use babel';
import { createText, createElement } from '../element/index';
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from './UIButtonGroup';
export var FormActionType;
(function (FormActionType) {
    FormActionType[FormActionType["Cancel"] = 0] = "Cancel";
    FormActionType[FormActionType["Commit"] = 1] = "Commit";
})(FormActionType || (FormActionType = {}));
export class UICommonsFactory {
    static createFormActions(options) {
        let actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
            .addButton(new UIButtonConfig()
            .setId('cancel')
            .setCaption(options.cancel.caption)
            .setClickListener(() => {
            options.actionListener(FormActionType.Cancel);
        }))
            .addButton(new UIButtonConfig()
            .setId('saveChanges')
            .setButtonType('success')
            .setCaption(options.commit.caption)
            .setClickListener(() => {
            options.actionListener(FormActionType.Commit);
        }));
        let actionButtonsContainer = createElement('div', {
            elements: [
                actionButtons.element()
            ],
            className: 'de-workbench-ui-form-action-buttons'
        });
        let mainContainer = createElement('div', {
            elements: [actionButtonsContainer],
            className: 'de-workbench-ui-form-action-buttons-container'
        });
        return mainContainer;
    }
    static createFormSeparator() {
        let divider = createElement('hr', {
            className: 'form-divider de-workbench-ui-form-divider'
        });
        return divider;
    }
    static createFormSectionTitle(title) {
        let divider = createElement('h2', {
            elements: [
                createText(title)
            ],
            className: 'de-workbench-ui-form-section-title'
        });
        return divider;
    }
}
//# sourceMappingURL=UICommonsFactory.js.map