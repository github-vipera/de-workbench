export declare class InkProvider {
    private static instance;
    private _ink;
    private _cons;
    private constructor();
    static getInstance(): InkProvider;
    setInk(ink: any): void;
    getInk(): any;
    isAvailable(): boolean;
    protected createConsole(): void;
    getConsole(): any;
}
