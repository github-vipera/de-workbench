import { UIBaseComponent } from './UIComponent';
export declare class UIStackedView extends UIBaseComponent {
    protected title: string;
    protected iconClassName: string;
    protected innerView: HTMLElement;
    protected subtleView: HTMLElement;
    protected titleElement: Text;
    protected titleIcon: HTMLElement;
    protected headerElement: HTMLElement;
    constructor();
    protected buildUI(): void;
    addHeaderClassName(className: string): UIStackedView;
    setIconClassName(className: string): UIStackedView;
    setTitle(title: string): UIStackedView;
    setInnerView(view: HTMLElement): UIStackedView;
    setSubtleView(view: HTMLElement): UIStackedView;
    destroy(): void;
}
