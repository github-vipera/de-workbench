export declare class GlobalPreferences {
    private static _instance;
    private _db;
    private constructor();
    private ensureFolder(folder);
    private saveTimestamp();
    static readonly preferencesFolder: string;
    protected static readonly userHome: string;
    static getInstance(): GlobalPreferences;
    get(key: string): any;
    save(key: string, value: any): void;
    delete(key: string): void;
}
