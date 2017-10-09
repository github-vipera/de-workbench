export declare class ExecutorService {
    private static instance;
    private constructor();
    static getInstance(): ExecutorService;
    runExec(path: string, command: string): Promise<any>;
}
