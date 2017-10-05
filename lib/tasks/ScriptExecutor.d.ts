import { CommandExecutor } from '../utils/CommandExecutor';
export declare class ScriptExecutor extends CommandExecutor {
    constructor();
    runNpmScript(name: string, basePath: string): Promise<{}>;
    runNpmScripts(names: Array<string>, basePath: string, cliOptions?: any): Promise<any>;
    private runScriptImpl(name, basePath, cliOptions?);
    stop(): void;
}
