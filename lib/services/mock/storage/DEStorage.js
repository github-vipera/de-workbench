'use babel';
class DEStorageImpl {
    constructor() {
        this.localStorageObj = {};
    }
    set(key, value) {
        this.localStorageObj[key] = value;
    }
    setObject(key, value) {
        this.set(key, JSON.stringify(value));
    }
    get(key) {
        return this.localStorageObj[key];
    }
    getObject(key) {
        var rawValue = this.get(key);
        if (rawValue == 'undefined') {
            return undefined;
        }
        if (rawValue) {
            return JSON.parse(rawValue);
        }
        return rawValue;
    }
    remove(key) {
        delete this.localStorageObj[key];
    }
    clear() {
        this.localStorageObj = {};
    }
    getLength() {
        return Object.keys(this.localStorageObj).length;
    }
    printAllData() {
        Object.keys(this.localStorageObj).forEach((i) => {
            console.log(i + ": " + this.get(i));
        });
    }
}
export class DEStorageFactory {
    getDEStorage() {
        return new DEStorageImpl();
    }
}
//# sourceMappingURL=DEStorage.js.map