import { UIBaseComponent } from '../../ui-components/UIComponent';
import { LoggerListener, LogLevel } from '../../logger/Logger';
export declare class NewProjectProgressPanel extends UIBaseComponent implements LoggerListener {
    private logOverlayElement;
    private loggerComponent;
    private started;
    constructor();
    protected initUI(): void;
    private bindWithLogger();
    onLogging(level: LogLevel, msg: string): void;
    destroy(): void;
    show(): void;
    hide(): void;
    startLog(): void;
    stopLog(): void;
}
