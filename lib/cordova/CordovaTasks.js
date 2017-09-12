'use babel';
export class CordovaTaskConfiguration {
    constructor(name, taskType) {
        this._name = name;
        this.taskType = taskType;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get displayName() {
        return this._displayName;
    }
    set displayName(value) {
        this._displayName = value;
    }
    get taskType() {
        return this._taskType;
    }
    set taskType(value) {
        this._taskType = value;
    }
    get selectedPlatform() {
        return this._selectedPlatform;
    }
    set selectedPlatform(value) {
        this._selectedPlatform = value;
    }
    get variantName() {
        return this._variantName;
    }
    set variantName(value) {
        this._variantName = value;
    }
    get isRelease() {
        return this._isRelease;
    }
    set isRelease(value) {
        this._isRelease = value;
    }
    get nodeTasks() {
        return this._nodeTasks;
    }
    set nodeTasks(value) {
        this._nodeTasks = value;
    }
    get constraints() {
        return this._constraints;
    }
    set constraints(value) {
        this._constraints = value;
    }
    get device() {
        return this._device;
    }
    set device(value) {
        this._device = value;
    }
    get envVariables() {
        return this._envVariables;
    }
    set envVariables(value) {
        this._envVariables = value;
    }
    get cliParams() {
        return this._cliParams;
    }
    set cliParams(value) {
        this._cliParams = value;
    }
    static fromJSON(json) {
        let result = new CordovaTaskConfiguration();
        Object.assign(result, json);
        return result;
    }
    static toJSON(taskConfig) {
        return JSON.stringify(taskConfig);
    }
}
export class CordovaTask {
    constructor(name, configuration) {
        this._name = name;
        this._configuration = configuration;
    }
    get name() {
        return this._name;
    }
    get configuration() {
        return this._configuration;
    }
    set configuration(configuration) {
        this._configuration = configuration;
    }
}
//# sourceMappingURL=CordovaTasks.js.map