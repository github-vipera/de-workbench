'use babel';
'use babel';
import { Logger } from '../logger/Logger';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
var JsonDB = require('node-json-db');
export class GlobalPreferences {
    constructor() {
        this.ensureFolder(GlobalPreferences.preferencesFolder);
        let prefsFile = path.join(GlobalPreferences.preferencesFolder, 'de_workbench_preferences.json');
        this._db = new JsonDB(prefsFile, true, true);
        Logger.consoleLog("Global Preferences:", prefsFile);
    }
    ensureFolder(folder) {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
    saveTimestamp() {
        this.save("last_access", new Date().toString());
    }
    static get preferencesFolder() {
        return path.join(GlobalPreferences.userHome, ".de_workbench");
    }
    static get userHome() {
        return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    }
    static getInstance() {
        if (!this._instance) {
            this._instance = new GlobalPreferences();
        }
        return this._instance;
    }
    get(key) {
        try {
            return this._db.getData(key);
        }
        catch (error) {
            return null;
        }
        ;
    }
    save(key, value) {
        this._db.push(key, value);
    }
    delete(key) {
        this._db.delete(key);
    }
}
//# sourceMappingURL=GlobalPreferences.js.map