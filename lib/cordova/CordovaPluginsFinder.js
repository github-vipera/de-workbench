'use babel';
import { Logger } from '../logger/Logger';
import { CordovaPlugin } from './Cordova';
const _ = require("lodash");
const $ = require("jquery");
const http = require("http");
const httpReq = require("request");
export class CordovaPluginsFinder {
    constructor() {
        this.pluginsData = {};
        Logger.getInstance().debug("Creating Cordova Plugins Finder...");
    }
    buildQueryParamsString(names, keywords, platforms) {
        var ret = "";
        var i = 0;
        if (keywords && keywords.length > 0) {
            for (i = 0; i < keywords.length; i++) {
                if (ret.length > 0) {
                    ret += "+OR+";
                }
                ret += "keywords:" + keywords[i];
            }
        }
        if (names && names.length > 0) {
            for (i = 0; i < names.length; i++) {
                if (ret.length > 0) {
                    ret += "+OR+";
                }
                ret += "name:*" + names[i] + "*";
            }
        }
        if (names && names.length > 0) {
            for (i = 0; i < names.length; i++) {
                if (ret.length > 0) {
                    ret += "+OR+";
                }
                ret += "description:*" + names[i] + "*";
            }
        }
        if (ret.length > 0) {
            ret = "&q=" + ret;
        }
        return ret;
    }
    search(names, keywords, platforms) {
        return new Promise((resolve, reject) => {
            var baseQueryUrl = 'https://npmsearch.com/query?fields=name,keywords,license,description,author,modified,homepage,version,rating&ecosystem:cordova&sort=rating:desc&size=500&start=0';
            var queryParams = this.buildQueryParamsString(names, keywords);
            Logger.getInstance().debug("Query:" + queryParams);
            var queryUrl = baseQueryUrl + queryParams;
            Logger.getInstance().debug("QueryURL:" + queryUrl);
            httpReq(queryUrl, function (error, response, body) {
                if (error) {
                    Logger.getInstance().error("Cordova Plugins Query error: ", error);
                    reject(error);
                }
                else {
                    Logger.getInstance().info("Cordova Plugins Query Success");
                    let pluginsArray = new Array();
                    let rawJsonArr = JSON.parse(body).results;
                    for (var i = 0; i < rawJsonArr.length; i++) {
                        let rawJson = rawJsonArr[i];
                        if (CordovaPluginsFinder.filterPlugin(rawJson, platforms)) {
                            let cordovaPlugin = new CordovaPlugin();
                            cordovaPlugin.author = rawJson.author[0];
                            cordovaPlugin.description = rawJson.description[0];
                            cordovaPlugin.version = rawJson.version[0];
                            cordovaPlugin.id = rawJson.name[0];
                            cordovaPlugin.name = rawJson.name[0];
                            cordovaPlugin.installed = false;
                            cordovaPlugin.homepage = "https://www.npmjs.com/package/" + cordovaPlugin.name;
                            cordovaPlugin.lastUpdateTime = rawJson.modified[0];
                            try {
                                cordovaPlugin.rating = parseFloat(rawJson.rating[0]);
                            }
                            catch (ex) { }
                            cordovaPlugin.platforms = CordovaPluginsFinder.readAvailablePlatforms(rawJson);
                            let platformIsOk = CordovaPluginsFinder.filterForPlatforms(cordovaPlugin, platforms);
                            if (platformIsOk) {
                                pluginsArray.push(cordovaPlugin);
                            }
                        }
                    }
                    resolve(pluginsArray);
                }
            });
        });
    }
    static filterForPlatforms(plugin, platforms) {
        if (!platforms) {
            return true;
        }
        for (var i = 0; i < platforms.length; i++) {
            if (_.findIndex(plugin.platforms, { 'name': platforms[i] }) > -1) {
                return true;
            }
        }
        return false;
    }
    static readAvailablePlatforms(jsonRaw) {
        if (!jsonRaw.keywords) {
            return [];
        }
        let ret = new Array();
        if (CordovaPluginsFinder.isPlatformSupported(jsonRaw, 'ios')) {
            ret.push({ name: "ios", displayName: "iOS" });
        }
        if (CordovaPluginsFinder.isPlatformSupported(jsonRaw, 'android')) {
            ret.push({ name: "android", displayName: "Android" });
        }
        if (CordovaPluginsFinder.isPlatformSupported(jsonRaw, 'browser')) {
            ret.push({ name: "browser", displayName: "Browser" });
        }
        return ret;
    }
    static isPlatformSupported(jsonRaw, platform) {
        if (_.indexOf(jsonRaw.keywords, 'cordova-' + platform) > -1) {
            return true;
        }
        else if (_.indexOf(jsonRaw.keywords, platform) > -1) {
            return true;
        }
        else
            return false;
    }
    static filterPlugin(jsonRaw, platforms) {
        if (!CordovaPluginsFinder.isCordovaPlugin(jsonRaw)) {
            return false;
        }
        return true;
    }
    static isCordovaPlugin(jsonRaw) {
        if (jsonRaw.keywords) {
            return (_.indexOf(jsonRaw.keywords, 'ecosystem:cordova') > -1);
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=CordovaPluginsFinder.js.map