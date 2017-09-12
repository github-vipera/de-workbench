'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
export class UINotifications {
    static showInfo(message, options) {
        atom.notifications.addInfo(message, options);
    }
    static showError(message, options) {
        atom.notifications.addError(message, options);
    }
}
//# sourceMappingURL=UINotifications.js.map