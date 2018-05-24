'use babel';
import { Logger } from '../logger/Logger';
const path = require("path");
const fs = require("fs");
const _ = require("lodash");
const xml2js = require('xml2js');
const provisioning = require('provisioning');
const plist = require('simple-plist');
var parseString = require('xml2js').parseString;
export class IOSUtilities {
    static loadProvisioningProfiles() {
        return new Promise((resolve, reject) => {
            Logger.getInstance().debug("Loading iOS Provisioning Profiles...");
            let provisioningProfiles = {};
            let provisioningProfileFolder = IOSUtilities.getProvisionigProfilesFolder();
            Logger.getInstance().debug("iOS Provisioning Profiles folder: " + provisioningProfileFolder);
            let provisioningFileNames = fs.readdirSync(provisioningProfileFolder);
            let totalFilesToProcess = provisioningFileNames.length;
            let profilesAdded = 0;
            Logger.getInstance().debug("Found " + totalFilesToProcess + " files found.");
            for (var i = 0; i < provisioningFileNames.length; i++) {
                let filename = path.join(provisioningProfileFolder, provisioningFileNames[i]);
                var fileContent = fs.readFileSync(filename, "utf8");
                try {
                    let plistContentStart = fileContent.indexOf("<plist");
                    let plistContentEnd = fileContent.indexOf("</plist>");
                    let plistContent = fileContent.substring(plistContentStart, plistContentEnd + "</plist>".length);
                    var data = plist.parse(plistContent);
                    if (data) {
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
                        profilesAdded++;
                    }
                }
                catch (ex) {
                    Logger.getInstance().debug("The file " + filename + " does not seem to be a provisioning profile.");
                }
                totalFilesToProcess--;
                if (totalFilesToProcess == 0) {
                    Logger.getInstance().debug("Profiles loaded " + profilesAdded);
                    resolve(provisioningProfiles);
                }
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