import { UIPane } from '../../ui-components/UIPane';
export declare class PushToolView extends UIPane {
    private tabbedView;
    private sendPushView;
    private pushSettingsView;
    constructor(uri: string);
    protected createUI(): HTMLElement;
    destroy(): void;
}
