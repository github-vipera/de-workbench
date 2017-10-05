'use babel';
export class UINotifications {
    static showInfo(message, options) {
        atom.notifications.addInfo(message, options);
    }
    static showError(message, options) {
        atom.notifications.addError(message, options);
    }
}
//# sourceMappingURL=UINotifications.js.map