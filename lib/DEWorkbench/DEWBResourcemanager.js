'use babel';
const fs = require('fs');
export class DEWBResourceManager {
    static getResourcePath(resourceName) {
        let packagePath = atom["packages"].getActivePackage('de-workbench').path;
        return packagePath + "/resources/" + resourceName;
    }
    static getResourceContent(resourceName) {
        let path = DEWBResourceManager.getResourcePath(resourceName);
        return fs.readFileSync(path, "utf-8");
    }
    static getJSONResource(resourceName) {
        return JSON.parse(DEWBResourceManager.getResourceContent(resourceName));
    }
}
//# sourceMappingURL=DEWBResourceManager.js.map