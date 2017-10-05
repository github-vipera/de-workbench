'use babel';
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
export class VariantsManager {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.variantsFolder = path.join(this.projectRoot, 'variants');
        this.variantsFilePath = path.join(this.variantsFolder, 'variants_def.xml');
    }
    load() {
        var parser = new xml2js.Parser();
        let variantsFieName = this.getFilePath();
        return new Promise((resolve, reject) => {
            var that = this;
            if (!this.fileExists()) {
                resolve(new VariantsModel());
                return;
            }
            fs.readFile(variantsFieName, function (err, data) {
                parser.parseString(data, function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        console.log("Variants file loaded:", result);
                        resolve(that.fromXMLtoModel(result));
                    }
                });
            });
        });
    }
    fromXMLtoModel(xmlContent) {
        let model = new VariantsModel();
        if (xmlContent.variants && xmlContent.variants.variant && xmlContent.variants.variant.length > 0) {
            for (var i = 0; i < xmlContent.variants.variant.length; i++) {
                let xmlVariant = xmlContent.variants.variant[i];
                let variantImpl = model.addVariant(xmlVariant.$.name);
                if (xmlVariant.preference && xmlVariant.preference.length > 0) {
                    for (var p = 0; p < xmlVariant.preference.length; p++) {
                        let xmlPreference = xmlVariant.preference[p];
                        variantImpl.addPreference(xmlPreference.$.name, xmlPreference.$.value);
                    }
                }
                if (xmlVariant.platform && xmlVariant.platform.length > 0) {
                    for (var p = 0; p < xmlVariant.platform.length; p++) {
                        let xmlPlatform = xmlVariant.platform[p];
                        let platform = variantImpl.addPlatform(xmlPlatform.$.name);
                        if (xmlPlatform.preference && xmlPlatform.preference.length) {
                            for (var k = 0; k < xmlPlatform.preference.length; k++) {
                                let xmlPreference = xmlPlatform.preference[k];
                                platform.addPreference(xmlPreference.$.name, xmlPreference.$.value);
                            }
                        }
                    }
                }
            }
        }
        return model;
    }
    fromModelToXML(model) {
        var xmlContent = {};
        xmlContent.variants = {};
        xmlContent.variants.variant = [];
        for (var i = 0; i < model.variants.length; i++) {
            let variant = model.variants[i];
            var xmlVariant = {};
            xmlVariant.$ = {};
            xmlVariant.$.name = variant.name;
            xmlVariant.preference = [];
            for (var p = 0; p < variant.preferences.length; p++) {
                let preference = variant.preferences[p];
                var xmlPreference = {};
                xmlPreference.$ = {};
                xmlPreference.$.name = preference.name;
                xmlPreference.$.value = preference.value;
                xmlVariant.preference.push(xmlPreference);
            }
            xmlVariant.platform = [];
            for (var p = 0; p < variant.platforms.length; p++) {
                let platform = variant.platforms[p];
                var xmlPlatform = {};
                xmlPlatform.$ = {};
                xmlPlatform.$.name = platform.name;
                xmlPlatform.preference = [];
                for (var k = 0; k < platform.preferences.length; k++) {
                    let preference = platform.preferences[k];
                    var xmlPreference = {};
                    xmlPreference.$ = {};
                    xmlPreference.$.name = preference.name;
                    xmlPreference.$.value = preference.value;
                    xmlPlatform.preference.push(xmlPreference);
                }
                xmlVariant.platform.push(xmlPlatform);
            }
            xmlContent.variants.variant.push(xmlVariant);
        }
        console.log("xmlContent:", xmlContent);
        return xmlContent;
    }
    store(model) {
        var builder = new xml2js.Builder();
        var xml = builder.buildObject(this.fromModelToXML(model));
        if (!fs.existsSync(this.variantsFolder)) {
            fs.mkdirSync(this.variantsFolder);
        }
        fs.writeFileSync(this.variantsFilePath, xml);
        console.log("Variants file stored");
    }
    fileExists() {
        return fs.existsSync(this.variantsFilePath);
    }
    getFilePath() {
        return this.variantsFilePath;
    }
}
export class VariantsModel {
    constructor() {
        this.variants = [];
    }
    addVariant(variantName) {
        let newVariant = new Variant(variantName);
        this.variants.push(newVariant);
        return newVariant;
    }
    getVariant(variantName) {
        return _.find(this.variants, { name: variantName });
    }
    removeVariant(variantName) {
        _.remove(this.variants, function (variant) {
            return (variant.name === variantName);
        });
    }
}
export class Variant {
    constructor(variantName) {
        this.name = variantName;
        this.preferences = [];
        this.platforms = [];
    }
    addPreference(name, value) {
        this.preferences.push(new VariantPreference(name, value));
    }
    addPlatform(name) {
        let newPlatform = new VariantPlatform(name);
        this.platforms.push(newPlatform);
        return newPlatform;
    }
    getOrCreatePlatformByName(platformName) {
        let platform = this.getPlatformByName(platformName);
        if (!platform) {
            platform = this.addPlatform(platformName);
        }
        return platform;
    }
    getPlatformByName(platformName) {
        for (var i = 0; i < this.platforms.length; i++) {
            if (this.platforms[i].name === platformName) {
                return this.platforms[i];
            }
        }
        return null;
    }
    cloneFrom(variantToClone) {
        this.preferences = [];
        this.platforms = [];
        for (var i = 0; i < variantToClone.preferences.length; i++) {
            this.addPreference(variantToClone.preferences[i].name, variantToClone.preferences[i].value);
        }
        for (var i = 0; i < variantToClone.platforms.length; i++) {
            let variantPlatformToClone = variantToClone.platforms[i];
            let variantPlatform = this.addPlatform(variantPlatformToClone.name);
            for (var k = 0; k < variantPlatformToClone.preferences.length; k++) {
                variantPlatform.addPreference(variantPlatformToClone.preferences[k].name, variantPlatformToClone.preferences[k].value);
            }
        }
    }
}
export class VariantPlatform {
    constructor(platformName) {
        this.name = platformName;
        this.preferences = [];
    }
    addPreference(name, value) {
        this.preferences.push(new VariantPreference(name, value));
    }
}
export class VariantPreference {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }
}
//# sourceMappingURL=VariantsManager.js.map