import { UIPane } from '../ui-components/UIPane';
export declare class LoggerView extends UIPane {
    private logModel;
    private loggerComponent;
    constructor(params: any);
    protected createUI(): any;
    close(): void;
    destroy(): void;
}
