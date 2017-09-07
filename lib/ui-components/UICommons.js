'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement } from '../element/index';
export class UICommonsFactory {
}
//Action buttons
this.actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
    .addButton(new UIButtonConfig()
    .setId('revertChanges')
    .setCaption('Revert Changes')
    .setClickListener(() => {
    this.reload();
}))
    .addButton(new UIButtonConfig()
    .setId('saveChanges')
    .setButtonType('success')
    .setCaption('Save changes')
    .setClickListener(() => {
    this.saveChanges();
}));
let actionButtonsContainer = createElement('div', {
    elements: [
        this.actionButtons.element()
    ],
    className: 'de-workbench-appinfo-form-action-buttons'
});
//# sourceMappingURL=UICommons.js.map