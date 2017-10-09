import { UIBaseComponent } from '../../../ui-components/UIComponent';
export declare class AppSignatureView extends UIBaseComponent {
    private tabbedView;
    private stackedPage;
    private iosEditor;
    private androidEditor;
    private currentProjectPath;
    private buildJson;
    constructor();
    private buildUI();
    protected updateUI(buildJson: any): void;
    protected reload(): void;
    protected getBuildJsonPath(): string;
    protected defaultBuildJson(): {
        "ios": {
            "debug": {};
            "release": {};
        };
        "android": {
            "debug": {};
            "release": {};
        };
    };
    protected reloadBuildJson(): any;
    protected writeBuildJson(buildJson: any): void;
    destroy(): void;
}
