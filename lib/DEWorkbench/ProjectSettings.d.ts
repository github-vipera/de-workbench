export declare class ProjectSettings {
    private projectRoot;
    private db;
    constructor(projectRoot: string);
    getProjectRoot(): string;
    getProjectInfoFilePath(projectPath: string): any;
    load(): Promise<ProjectSettings>;
    get(key: string): any;
    save(key: string, value: any): any;
    private getCompleteIntarnalPath();
}
