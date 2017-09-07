import { UIBaseComponent } from './UIComponent';
export declare class UITextEditorExtended extends UIBaseComponent {
    private buttonCaption;
    private buttonText;
    private buttonElement;
    private inputEl;
    private editor;
    private buttonHandler;
    private editorHandler;
    constructor();
    private initUI();
    setTextPlaceholder(placeholder: string): UITextEditorExtended;
    setButtonClassName(className: string): UITextEditorExtended;
    setButtonCaption(caption: string): UITextEditorExtended;
    addButtonHandler(handler: any): UITextEditorExtended;
    addEditorHandler(handler: any): UITextEditorExtended;
    getValue(): string;
    getEditor(): any;
    destroy(): void;
}
