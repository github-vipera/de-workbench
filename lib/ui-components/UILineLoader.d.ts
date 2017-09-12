import { UIBaseComponent } from './UIComponent';
export declare class UILineLoader extends UIBaseComponent {
    private onLoading;
    constructor();
    initUI(): void;
    setOnLoading(value: boolean): void;
    private updateUI();
}
