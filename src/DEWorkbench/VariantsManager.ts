'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { EventEmitter }  from 'events'
import { Cordova } from '../cordova/Cordova'
import { Logger } from '../logger/Logger'
import { EventBus } from '../DEWorkbench/EventBus'

const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path')

/*
export interface VariantPlatform {
    name:string;
    preferences:Array<VariantPreference>
}

export interface Variant {
  name:string;
  preferences:Array<VariantPreference>
  platforms:Array<VariantPlatform>
}

export interface VariantsModel {
  variants:Array<Variant>;
}
**/


export class VariantsManager {

  protected projectRoot:string;
  protected variantsFilePath:string;
  protected variantsFolder:string;

  constructor(projectRoot:string){
      this.projectRoot = projectRoot;
      this.variantsFolder = path.join(this.projectRoot, 'variants');
      this.variantsFilePath = path.join(this.variantsFolder, 'variants_def.xml');
  }

  public load():Promise<VariantsModel>{
    var parser = new xml2js.Parser();
    let variantsFieName = this.getFilePath();
    return new Promise((resolve, reject)=>{
      var that = this;
      if (!this.fileExists()){
        resolve(new VariantsModel());
        return;
      }
      fs.readFile(variantsFieName, function(err, data) {
        parser.parseString(data, function (err, result) {
          if (err){
            reject(err)
          } else {
            console.log("Variants file loaded:" , result)
            resolve(that.fromXMLtoModel(result));
          }
        });
      });
    })
  }

  protected fromXMLtoModel(xmlContent:any):VariantsModel {
    let model = new VariantsModel();
    // scan for variants
    if (xmlContent.variants && xmlContent.variants.variant && xmlContent.variants.variant.length > 0){

      for (var i=0;i<xmlContent.variants.variant.length;i++){
          let xmlVariant = xmlContent.variants.variant[i]
          let variantImpl = model.addVariant(xmlVariant.$.name);
          // scan for preferences
          if (xmlVariant.preference && xmlVariant.preference.length>0){
            for (var p=0;p<xmlVariant.preference.length;p++){
              let xmlPreference = xmlVariant.preference[p]
              variantImpl.addPreference(xmlPreference.$.name, xmlPreference.$.value)
            }
          }
          // scan for platforms
          if (xmlVariant.platform && xmlVariant.platform.length>0){
            for (var p=0;p<xmlVariant.platform.length;p++){
              let xmlPlatform = xmlVariant.platform[p]
              let platform = variantImpl.addPlatform(xmlPlatform.$.name)
              // scan for preferences
              if (xmlPlatform.preference && xmlPlatform.preference.length){
                for (var k=0;k<xmlPlatform.preference.length;k++){
                  let xmlPreference = xmlPlatform.preference[k]
                  platform.addPreference(xmlPreference.$.name, xmlPreference.$.value)
                }
              }
            }
          }
      }

    }
    return model;
  }

  protected fromModelToXML(model:VariantsModel):any {
    var xmlContent:any = {};
    xmlContent.variants = {};
    xmlContent.variants.variant = [];

    for (var i=0;i<model.variants.length;i++){
      let variant:Variant = model.variants[i]
      var xmlVariant:any = {};
      xmlVariant.$ = {};
      xmlVariant.$.name = variant.name;
      xmlVariant.preference = []

      // scan for preferences
      for (var p=0;p<variant.preferences.length;p++){
        let preference = variant.preferences[p]
        var xmlPreference:any = {};
        xmlPreference.$ = {};
        xmlPreference.$.name = preference.name;
        xmlPreference.$.value = preference.value;
        xmlVariant.preference.push(xmlPreference);
      }

      xmlVariant.platform = []
      // scan for platforms
      for (var p=0;p<variant.platforms.length;p++){
        let platform:VariantPlatform = variant.platforms[p]
        var xmlPlatform:any = {};
        xmlPlatform.$ = {};
        xmlPlatform.$.name = platform.name;
        xmlPlatform.preference = [];
        // scan for platform preferences
        for (var k=0;k<platform.preferences.length;k++){
          let preference = platform.preferences[k]
          var xmlPreference:any = {};
          xmlPreference.$ = {};
          xmlPreference.$.name = preference.name;
          xmlPreference.$.value = preference.value;
          xmlPlatform.preference.push(xmlPreference);
        }
        xmlVariant.platform.push(xmlPlatform)
      }

      xmlContent.variants.variant.push(xmlVariant)
    }

    console.log("xmlContent:",xmlContent)
    return xmlContent;
  }

  public store(model:VariantsModel){
    var builder = new xml2js.Builder();
    var xml = builder.buildObject(this.fromModelToXML(model));
    if(!fs.existsSync(this.variantsFolder)){
      fs.mkdirSync(this.variantsFolder);
    }
    fs.writeFileSync(this.variantsFilePath,xml);
    console.log("Variants file stored")
  }

  public fileExists():boolean {
      return fs.existsSync(this.variantsFilePath)
  }

  public getFilePath():string {
    return this.variantsFilePath;
  }

}

export class VariantsModel {

  public variants:Array<Variant>;

  constructor(){
    this.variants = []
  }

  public addVariant(variantName:string):Variant {
    let newVariant = new Variant(variantName)
    this.variants.push(newVariant);
    return newVariant;
  }

  public getVariant(variantName:string):Variant {
    for (var i=0;i<this.variants.length;i++){
      if (this.variants[i].name===variantName){
        return this.variants[i]
      }
    }
    return null;
  }


}

export class Variant {

  name:string;
  preferences:Array<VariantPreference>
  platforms:Array<VariantPlatform>

  constructor(variantName:string){
    this.name = variantName;
    this.preferences = [];
    this.platforms = [];
  }

  addPreference(name:string,value:string){
      this.preferences.push(new VariantPreference(name, value))
  }

  addPlatform(name:string):VariantPlatform{
    let newPlatform = new VariantPlatform(name);
    this.platforms.push(newPlatform)
    return newPlatform;
  }

  public getOrCreatePlatformByName(platformName:string):VariantPlatform{
      let platform = this.getPlatformByName(platformName);
      if (!platform){
        platform = this.addPlatform(platformName)
      }
      return platform;
  }

  public getPlatformByName(platformName:string):VariantPlatform{
    for (var i=0;i<this.platforms.length;i++){
        if (this.platforms[i].name===platformName){
          return this.platforms[i]
        }
    }
    return null;
  }

  public cloneFrom(variantToClone:Variant){
    this.preferences = [];
    this.platforms = [];
    // clone preferences
    for (var i=0;i<variantToClone.preferences.length;i++){
      this.addPreference(variantToClone.preferences[i].name, variantToClone.preferences[i].name)
    }
    // clone platforms
    for (var i=0;i<variantToClone.platforms.length;i++){
      let variantPlatformToClone = variantToClone.platforms[i];
      let variantPlatform = this.addPlatform(variantPlatformToClone.name);
      // clone preferences
      for (var k=0;k<variantPlatformToClone.preferences.length;k++){
        variantPlatform.addPreference(variantPlatformToClone.preferences[k].name, variantPlatformToClone.preferences[k].name)
      }
    }
  }

}

export class VariantPlatform  {
  name:string;
  preferences:Array<VariantPreference>
  constructor(platformName:string){
    this.name = platformName;
    this.preferences = [];
  }
  addPreference(name:string,value:string){
    this.preferences.push(new VariantPreference(name, value))
  }
}

export class VariantPreference {
    name:string;
    value:string;
    constructor(name:string,value:string){
      this.name = name;
      this.value = value;
    }
}
