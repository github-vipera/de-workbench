export declare class CommandExecutor {
    protected isWin: boolean;
    protected basePath: string;
    protected spawnRef: any;
    constructor(path: string);
    prepareCommand(cmd: string): string;
    getCmdOptions(path?: string): any;
    isBusy(): boolean;
    stopSpawn(): void;
    runExec(cmd: string): Promise<any>;
    runSpawn(command: string, args: any, operationLogTag: any, withResult: any): Promise<any>;
}
