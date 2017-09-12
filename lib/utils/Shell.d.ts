export declare class Shell {
    private static instance;
    private constructor();
    static getInstance(): Shell;
    static openExternal(url: string): boolean;
    static beep(): void;
}
