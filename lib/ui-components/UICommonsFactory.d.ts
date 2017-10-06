export declare enum FormActionType {
    Cancel = 0,
    Commit = 1,
}
export interface FormActionsOptions {
    cancel: {
        caption: string;
    };
    commit: {
        caption: string;
    };
    actionListener: any;
}
export declare class UICommonsFactory {
    static createFormActions(options: FormActionsOptions): HTMLElement;
    static createFormSeparator(): HTMLElement;
    static createFormSectionTitle(title: string): HTMLElement;
}
