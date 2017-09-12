import { NewProjectInfo } from '../../cordova/Cordova';
export declare class NewProjectView {
    private readonly TXT_PROJECT_NAME;
    private readonly TXT_PROJECT_PACKAGE_ID;
    private readonly TXT_PROJECT_PATH;
    private element;
    private events;
    private panel;
    private projectPlatformButtons;
    private actionButtons;
    private projectTemplateSection;
    private newProjectTypeSelector;
    private newProjectProgressPanel;
    private logOverlayElement;
    private modalContainer;
    constructor();
    protected doCreateProject(): void;
    private validateNewProjectInfo(newPrjInfo);
    private showProjectTemplateSection(show);
    open(activePlugin?: Plugin): void;
    close(): void;
    private createTextElement(placeholder, id);
    private getNextControlFocus(currentID, evt);
    private createButton(caption);
    private createTextControlBlock(id, caption, placeholder);
    private createTextControlBlockWithButton(id, caption, placeholder, buttonCaption, buttonListener);
    private createTextElementWithButton(placeholder, id, buttonCaption, buttonListener);
    protected chooseFolder(): void;
    protected getCurrentSelectedFolder(): string;
    protected getCurrentSelectedPackagedID(): string;
    protected getCurrentSelectedProjectName(): string;
    protected getCurrentSelectedPlatforms(): Array<string>;
    protected getNewProjectInfo(): NewProjectInfo;
    protected destroy(): void;
}