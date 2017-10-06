import { UIBaseComponent } from '../../ui-components/UIComponent';
export declare class NewProjectTypeSelector extends UIBaseComponent {
    private projectTypeButtons;
    private projectTypes;
    private projectTemplateSection;
    private projectTemplateSelector;
    private captionElement;
    private buttonListener;
    constructor();
    private initUI();
    private getProjectTypeByName(name);
    private onTypeSelected(typeId);
    destroy(): void;
    getProjectType(): string;
    getTemplateName(): string;
}
