'use babel';
const _electron = require('electron');
export class Shell {
    constructor() {
    }
    static getInstance() {
        if (!Shell.instance) {
            Shell.instance = new Shell();
        }
        return Shell.instance;
    }
    static openExternal(url) {
        return _electron.shell.openExternal(url);
    }
    static beep() {
        _electron.shell.beep();
    }
}
//# sourceMappingURL=Shell.js.map