import { UIBaseComponent } from './UIComponent';
import { UISelect, UISelectListener } from './UISelect';
export interface UISelectButtonOptions {
    withArrow?: boolean;
    rightIcon?: string;
}
export declare class UISelectButton extends UIBaseComponent implements UISelectListener {
    private select;
    private txtSelected;
    private selectedItem;
    private emptyText;
    private uiOptions;
    constructor(select: UISelect, emptyText: string, options?: UISelectButtonOptions);
    initUI(): void;
    setSelectedItem(value: string): void;
    onItemSelected(value: string): void;
}
