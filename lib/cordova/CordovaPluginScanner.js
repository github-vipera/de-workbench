'use babel';
/*!
 * CordovaUtils - Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
const path = require("path");
const fs = require("fs-extra");
const _ = require("lodash");
const xml2js = require('xml2js');
export class CordovaPluginScanner {
    constructor() {
    }
    scan(projectRootPath, callbackFunc) {
        console.log("Scanning folder '" + path + "' for plugins...");
        try {
            this.pluginIds = new Array();
            this.path = projectRootPath;
            this.pluginsPath = projectRootPath + "/plugins";
            this.fetchJson = JSON.parse(fs.readFileSync(this.pluginsPath + "/fetch.json", 'utf8'));
            this.completionCallback = callbackFunc;
            this.scanningPlugins = 0;
            console.log("Plugins loaded: " + JSON.stringify(this.fetchJson));
            //mark total plugins to notify when completed
            this.scanningPlugins = Object.keys(this.fetchJson).length;
            if (this.scanningPlugins === 0) {
                this.completionCallback(this.getInstalledPlugin());
                return true;
            }
            for (var pluginId in this.fetchJson) {
                var pluginInfo = this.fetchJson[pluginId];
                var path = this.pluginsPath + "/" + pluginId;
                if (pluginInfo.source.type === 'local') {
                    if (pluginInfo.source.path && pluginInfo.source.path.startsWith(".")) {
                        path = this.path + "/" + pluginInfo.source.path;
                    }
                    else {
                        path = pluginInfo.source.path;
                    }
                }
                try {
                    this.scanPlugin(pluginId, path);
                }
                catch (ex) {
                    console.log("Error in plugin scan: " + ex);
                }
            }
            return true;
        }
        catch (err) {
            this.fetchJson = {};
            //atom.notifications.addError("Uhm...this project does not seem to be a Cordova project.");
            console.log("Error: " + err);
        }
    }
    scanPlugin(pluginId, path) {
        var that = this;
        console.log("scanPlugin for " + pluginId + " in path " + path);
        this.pluginIds.push(pluginId);
        var parser = new xml2js.Parser();
        fs.readFile(path + "/plugin.xml", function (err, data) {
            if (err) {
                console.error("Error scanning plugin '" + pluginId + "' in path " + path + ":", err);
            }
            else {
                parser.parseString(data, function (err, result) {
                    var pluginId = result.plugin.$.id;
                    that.fetchJson[pluginId].plugin = result.plugin;
                });
                let packageJsonJsonPath = path + "/package.json";
                if (fs.existsSync(packageJsonJsonPath)) {
                    try {
                        let packageJson = JSON.parse(fs.readFileSync(path + "/package.json", 'utf8'));
                        that.fetchJson[pluginId].packageJson = packageJson;
                    }
                    catch (ex) {
                        console.log("Error reading package.json: ", ex);
                    }
                }
            }
            that.scanningPlugins--;
            if (that.scanningPlugins == 0) {
                that.completionCallback(that.getInstalledPlugin());
            }
        });
    }
    getInstalledPlugin() {
        var countVal = Object.keys(this.fetchJson).length;
        var ret = { plugins: this.fetchJson, count: countVal };
        return ret;
    }
    isPluginInstalled(pluginId) {
        var check = this.fetchJson[pluginId];
        return ((check != null) && (check != undefined));
    }
}
//# sourceMappingURL=CordovaPluginScanner.js.map