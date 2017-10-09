'use babel';
export class UINotifications {
    static showInfo(message, options) {
        return atom.notifications.addInfo(message, options);
    }
    static showError(message, options) {
        return atom.notifications.addError(message, options);
    }
    static showSuccess(message, options) {
        return atom.notifications.addSuccess(message, options);
    }
}
//# sourceMappingURL=UINotifications.js.map