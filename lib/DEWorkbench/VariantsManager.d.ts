export declare class VariantsManager {
    protected projectRoot: string;
    protected variantsFilePath: string;
    protected variantsFolder: string;
    constructor(projectRoot: string);
    load(): Promise<VariantsModel>;
    protected fromXMLtoModel(xmlContent: any): VariantsModel;
    protected fromModelToXML(model: VariantsModel): any;
    store(model: VariantsModel): void;
    fileExists(): boolean;
    getFilePath(): string;
}
export declare class VariantsModel {
    variants: Array<Variant>;
    constructor();
    addVariant(variantName: string): Variant;
    getVariant(variantName: string): Variant;
    removeVariant(variantName: string): void;
}
export declare class Variant {
    name: string;
    preferences: Array<VariantPreference>;
    platforms: Array<VariantPlatform>;
    constructor(variantName: string);
    addPreference(name: string, value: string): void;
    addPlatform(name: string): VariantPlatform;
    getOrCreatePlatformByName(platformName: string): VariantPlatform;
    getPlatformByName(platformName: string): VariantPlatform;
    cloneFrom(variantToClone: Variant): void;
}
export declare class VariantPlatform {
    name: string;
    preferences: Array<VariantPreference>;
    constructor(platformName: string);
    addPreference(name: string, value: string): void;
}
export declare class VariantPreference {
    name: string;
    value: string;
    constructor(name: string, value: string);
}
