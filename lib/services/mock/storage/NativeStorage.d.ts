export interface NativeStorage {
    getItem(key: string, success: Function, fail: Function): void;
    setItem(key: string, value: any, success: Function, fail: Function): void;
    deleteItem(key: string, success: Function, fail: Function): void;
    clear(success: Function, fail: Function): void;
}
export declare class NativeStorageConfig {
    dbPath: string;
}
export declare class NativeStorageFactory {
    getNativeStorage(config: NativeStorageConfig): NativeStorage;
}
