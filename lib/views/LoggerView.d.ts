import { UIPane } from '../ui-components/UIPane';
export declare class LoggerView extends UIPane {
    private logModel;
    private loggerComponent;
    constructor(uri: string);
    protected createUI(): any;
    close(): void;
    destroy(): void;
}
