'use babel';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
const trivialdb = require('trivialdb');
const fs = require('fs');
const path = require('path');
export class ProjectSettings {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.db = trivialdb.db('project_settings', { loadFromDisk: true, rootPath: this.getProjectInfoFilePath(this.projectRoot), prettyPrint: true });
    }
    getProjectRoot() {
        return this.projectRoot;
    }
    getProjectInfoFilePath(projectPath) {
        return path.join(projectPath, '.deworkbench');
    }
    load() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.getCompleteIntarnalPath())) {
                resolve(this);
                return;
            }
            this.db.reload().then(() => {
                resolve(this);
            }, reject);
        });
    }
    get(key) {
        return this.db.get(key);
    }
    save(key, value) {
        return this.db.save(key, value);
    }
    getCompleteIntarnalPath() {
        return path.join(this.getProjectInfoFilePath(this.projectRoot), 'project_settings.json');
    }
}
//# sourceMappingURL=ProjectSettings.js.map