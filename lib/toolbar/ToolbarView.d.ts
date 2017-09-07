export interface ToolbarOptions {
    didNewProject?: Function;
    didRun?: Function;
    didStop?: Function;
    didBuild?: Function;
    didToggleToolbar?: Function;
    didTogglePrjInspector?: Function;
    didToggleDebugArea?: Function;
}
export declare class ToolbarView {
    private element;
    private events;
    private subscriptions;
    private newProjectButton;
    private runButton;
    private stopButton;
    private logoElement;
    private buildButton;
    constructor(options: ToolbarOptions);
    private toggleAtomTitleBar(value);
    displayAsTitleBar(): void;
    displayDefault(): void;
    destroy(): void;
    getElement(): HTMLElement;
}
