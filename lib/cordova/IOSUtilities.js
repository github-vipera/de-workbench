'use babel';
import { Logger } from '../logger/Logger';
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const xml2js = require('xml2js');
const provisioning = require('provisioning');
export class IOSUtilities {
    static loadProvisioningProfiles() {
        return new Promise((resolve, reject) => {
            Logger.getInstance().debug("Loading iOS Provisioning Profiles...");
            let provisioningProfiles = {};
            let provisioningProfileFolder = IOSUtilities.getProvisionigProfilesFolder();
            Logger.getInstance().debug("iOS Provisioning Profiles folder: " + provisioningProfileFolder);
            var provisioningFileNames = fs.readdirSync(provisioningProfileFolder);
            let totalFilesToProcess = provisioningFileNames.length;
            Logger.getInstance().debug("Found " + totalFilesToProcess + " profiles found.");
            for (var i = 0; i < provisioningFileNames.length; i++) {
                var filename = path.join(provisioningProfileFolder, provisioningFileNames[i]);
                provisioning(filename, function (error, data) {
                    if (error) {
                    }
                    else if (data) {
                        var appIdentifier = data.Entitlements['application-identifier'];
                        var teamIdentifier = data.TeamIdentifier;
                        var teamName = data.TeamName;
                        var applicationIdentifierPrefix = data.ApplicationIdentifierPrefix;
                        var appId = appIdentifier.substring(applicationIdentifierPrefix[0].length + 1, appIdentifier.length);
                        provisioningProfiles[appIdentifier] = {
                            "appId": appId,
                            "appIdentifier": appIdentifier,
                            "teamIdentifier": teamIdentifier,
                            "teamName": teamName,
                            "data": data
                        };
                    }
                    else {
                    }
                    totalFilesToProcess--;
                    if (totalFilesToProcess == 0) {
                        Logger.getInstance().debug("Profiles loaded.");
                        resolve(provisioningProfiles);
                    }
                });
            }
        });
    }
    static getProvisionigProfilesFolder() {
        let homeFolder = process.env['HOME'];
        let provisioningProfileFolder = path.join(homeFolder, "Library", "MobileDevice", "Provisioning Profiles");
        return provisioningProfileFolder;
    }
}
//# sourceMappingURL=IOSUtilities.js.map