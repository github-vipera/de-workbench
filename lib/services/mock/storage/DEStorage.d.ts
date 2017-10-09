export interface DEStorage {
    set(key: string, value: any): void;
    setObject(key: string, value: Object): void;
    get(key: string): string;
    getObject(key: string): Object;
    remove(key: any): void;
    clear(): void;
    getLength(): number;
    printAllData(): void;
}
export declare class DEStorageFactory {
    getDEStorage(): DEStorage;
}
