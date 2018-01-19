import { ServersView } from '../views/Servers/ServersView';
import { ServerInstanceConfigurationView } from '../views/Servers/ServerInstanceConfigurationView';
import { BookmarksView } from '../views/Bookmarks/BookmarksView';
import { PushToolView } from '../views/PushTool/PushToolView';
import { ProjectSettingsView } from '../views/ProjectSettings/ProjectSettingsView';
import { LoggerView } from '../views/LoggerView';
import { DebugAreaView } from '../views/DebugArea/DebugAreaView';
import { DebugBreakpointsView } from '../views/DebugArea/DebugBreakpointsView';
import { DebugCallStackView } from '../views/DebugArea/DebugCallStackView';
import { DebugVariablesView } from '../views/DebugArea/DebugVariablesView';
import { DebugWatchExpressionsView } from '../views/DebugArea/DebugWatchExpressionsView';
export declare class ViewManager {
    private _toggleRegisteredItems;
    constructor();
    protected registerOpeners(): void;
    protected manageURI(uri: string, params: any): ProjectSettingsView | PushToolView | LoggerView | ServerInstanceConfigurationView | BookmarksView | DebugAreaView | DebugBreakpointsView | DebugCallStackView | DebugVariablesView | DebugWatchExpressionsView | ServersView;
    static readonly VIEW_SERVERS: ViewInfo;
    static readonly VIEW_BOOKMARKS: ViewInfo;
    static VIEW_PUSHTOOLS(projectRoot: string): ViewInfo;
    static VIEW_SERVER_INSTANCE(serverInstance: any): ViewInfo;
    static VIEW_PROJECT_SETTINGS(projectRoot: string): ViewInfo;
    static readonly VIEW_LOG_INSPECTOR: ViewInfo;
    static readonly VIEW_DEBUG_AREA: ViewInfo;
    static readonly VIEW_DEBUG_BREAKPOINTS: ViewInfo;
    static readonly VIEW_DEBUG_CALL_STACK: ViewInfo;
    static readonly VIEW_DEBUG_VARIABLES: ViewInfo;
    static readonly VIEW_DEBUG_WATCH_EXPRESSIONS: ViewInfo;
    toggleView(viewInfo: ViewInfo): void;
    openView(viewInfo: ViewInfo, extUserData?: any): void;
    static locationFromString(location: string): any;
    static buildURI(viewPath: string, extraParam?: string): string;
    private registerToggleView(toggleView);
}
export interface ViewInfo {
    id: string;
    title: string;
    uri: string;
    location: string;
    activatePane: boolean;
    searchAllPanes: boolean;
    userData?: any;
    toggleEnable?: boolean;
}
