'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../logger/Logger'
import { CordovaPlugin } from './Cordova'

const _ = require("lodash");
const $ = require("jquery");
const http = require("http");
const httpReq = require ("request");


/**
 * This class allows to search plugins from the community repository
 */
export class CordovaPluginsFinder {

  protected pluginsData:any = {};

    constructor(){
      Logger.getInstance().debug("Creating Cordova Plugins Finder...");
    }

    /**
     * Build the query
     */
    private buildQueryParamsString(names,keywords,platforms?):string{
      var ret = "";
      var i = 0;
      if (keywords && keywords.length>0){
        for (i=0;i<keywords.length;i++){
          if (ret.length>0){
            ret += "+OR+";
          }
          ret += "keywords:" + keywords[i];
        }
      }

      /**
      //the platforms are keywords
      if (platforms && platforms.length>0){
        for (i=0;i<platforms.length;i++){
          if (ret.length>0){
            ret += "+OR+";
          }
          ret += "keywords:" + platforms[i];
        }
      }
      **/

      if (names && names.length>0){
        for (i=0;i<names.length;i++){
          if (ret.length>0){
            ret += "+OR+";
          }
          ret += "name:*" + names[i] +"*";
        }
      }

      /**
      //Limit to Cordova
      if (ret.length>0){
        ret += "+AND+";
      }
      ret += 'keywords:"ecosystem:cordova"';
      **/

      if (ret.length>0){
        ret = "&q=" + ret;
      }
      return ret;
    }

    /**
     * Search plugins from community
     */
    public search(names,keywords,platforms):Promise<Array<CordovaPlugin>>{
      return new Promise((resolve, reject) => {
        var baseQueryUrl = 'https://npmsearch.com/query?fields=name,keywords,license,description,author,modified,homepage,version,rating&ecosystem:cordova&sort=rating:desc&size=500&start=0';
        var queryParams = this.buildQueryParamsString(names, keywords);
        Logger.getInstance().debug("Query:" + queryParams);
        var queryUrl = baseQueryUrl + queryParams; //'q=keywords:camera+AND+author:neuber';
        Logger.getInstance().debug("QueryURL:" + queryUrl);
        httpReq(queryUrl, function (error, response, body) {
            if (error){
              Logger.getInstance().error("Cordova Plugins Query error: ", error);
              reject(error);
            } else {
              Logger.getInstance().info("Cordova Plugins Query Success");
              let pluginsArray = new Array();
              let rawJsonArr:any = JSON.parse(body).results;
              for (var i=0;i<rawJsonArr.length;i++){
                let rawJson = rawJsonArr[i];
                if (CordovaPluginsFinder.filterPlugin(rawJson, platforms)){
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
                  } catch (ex){}
                  cordovaPlugin.platforms = CordovaPluginsFinder.readAvailablePlatforms(rawJson);

                  let platformIsOk = CordovaPluginsFinder.filterForPlatforms(cordovaPlugin, platforms);

                  if (platformIsOk){
                    pluginsArray.push(cordovaPlugin);
                  }

                }
              }
              resolve(pluginsArray);
            }
        });
      });
    }

    private static filterForPlatforms(plugin:CordovaPlugin, platforms:Array<string>):boolean{
      if (!platforms){
        return true; //no filter
      }
      for (var i=0;i<platforms.length;i++){
        if (_.findIndex(plugin.platforms,{ 'name' : platforms[i]}) >-1){
          return true;
        }
      }
      return false;
    }

    private static readAvailablePlatforms(jsonRaw:any):Array<string>{
      if (!jsonRaw.keywords){
        return [];
      }
      let ret = new Array();
      if (CordovaPluginsFinder.isPlatformSupported(jsonRaw,'ios')){
        ret.push({ name:"ios", displayName: "iOS" })
      }
      if (CordovaPluginsFinder.isPlatformSupported(jsonRaw,'android')){
        ret.push({ name:"android", displayName: "Android" })
      }
      if (CordovaPluginsFinder.isPlatformSupported(jsonRaw,'browser')){
        ret.push({ name:"browser", displayName: "Browser" })
      }
      return ret
    }

    private static isPlatformSupported(jsonRaw:any, platform:string):boolean {
      if (_.indexOf(jsonRaw.keywords, 'cordova-' + platform )>-1){
        return true;
      }
      else if (_.indexOf(jsonRaw.keywords, platform )>-1){
        return true;
      }
      else return false;
    }

    private static filterPlugin(jsonRaw:any, platforms:Array<string>):boolean{
      if (!CordovaPluginsFinder.isCordovaPlugin(jsonRaw)){
        return false;
      }
      return true;
    }

    private static isCordovaPlugin(jsonRaw:any):boolean{
      if (jsonRaw.keywords){
        return (_.indexOf(jsonRaw.keywords, 'ecosystem:cordova')>-1)
      } else {
        return false;
      }
    }

}
