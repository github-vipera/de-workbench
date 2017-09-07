'use babel';
import { initSync, getItem, removeItem, clear } from 'node-persist';
export class NativeStorageConfig {
}
class NativeStorageImp {
    constructor(conf) {
        initSync({
            dir: conf.dbPath,
            stringify: JSON.stringify,
            parse: JSON.parse,
            encoding: 'utf8',
            logging: false,
            continuous: true,
            interval: false,
            ttl: false,
        });
    }
    getItem(key, success, fail) {
        getItem(key).then((value) => {
            if (value) {
                success(value);
            }
            else {
                success(null);
            }
        }, (err) => {
            console.error(err);
            success(null);
        });
    }
    setItem(key, value, success, fail) {
    }
    deleteItem(key, success, fail) {
        removeItem(key).then(() => {
            success();
        }, (err) => {
            console.error(err);
            fail(err);
        });
    }
    clear(success, fail) {
        clear().then(() => {
            success();
        }, (err) => {
            fail(err);
        });
    }
}
export class NativeStorageFactory {
    getNativeStorage(config) {
        return new NativeStorageImp(config);
    }
}
//# sourceMappingURL=NativeStorage.js.map