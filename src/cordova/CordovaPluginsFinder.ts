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
    private buildQueryParamsString(names,keywords,platforms):string{
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

      //the platforms are keywords
      if (platforms && platforms.length>0){
        for (i=0;i<platforms.length;i++){
          if (ret.length>0){
            ret += "+OR+";
          }
          ret += "keywords:" + platforms[i];
        }
      }

      if (names && names.length>0){
        for (i=0;i<names.length;i++){
          if (ret.length>0){
            ret += "+OR+";
          }
          ret += "name:*" + names[i] +"*";
        }
      }

      //Limit to Cordova
      if (ret.length>0){
        ret += "+AND+";
      }
      ret += 'keywords:"ecosystem:cordova"';

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
        var baseQueryUrl = 'http://npmsearch.com/query?fields=name,keywords,license,description,author,modified,homepage,version,rating&ecosystem:cordova&sort=rating:desc&size=500&start=0';
        var queryParams = this.buildQueryParamsString(names, keywords, platforms);
        Logger.getInstance().debug("Query:" + queryParams);
        var queryUrl = baseQueryUrl + queryParams; //'q=keywords:camera+AND+author:neuber';
        Logger.getInstance().debug("QueryURL:" + queryUrl);
        httpReq(queryUrl, function (error, response, body) {
            if (error){
              Logger.getInstance().error("Query error: ", error);
              reject(error);
            } else {
              Logger.getInstance().error("Query OK");
              let pluginsArray = new Array();
              let rawJsonArr:any = JSON.parse(body).results;
              for (var i=0;i<rawJsonArr.length;i++){
                let rawJson = rawJsonArr[i];
                let cordovaPlugin = new CordovaPlugin();
                cordovaPlugin.author = rawJson.author[0];
                cordovaPlugin.description = rawJson.description[0];
                cordovaPlugin.version = rawJson.version[0];
                cordovaPlugin.id = rawJson.name[0];
                cordovaPlugin.name = rawJson.name[0];
                cordovaPlugin.installed = false;
                pluginsArray.push(cordovaPlugin);
              }
              resolve(pluginsArray);
            }
        });
      });
    }

}
