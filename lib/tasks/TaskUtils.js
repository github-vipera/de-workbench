'use babel';
import { ProjectManager } from '../DEWorkbench/ProjectManager';
import { Logger } from '../logger/Logger';
import { findIndex, forEach } from 'lodash';
const CORDOVA_BUILD_VARIANT = 'CORDOVA_BUILD_VARIANT';
export class TaskUtils {
    constructor() { }
    static createPlatformServerConfig(taskConfig, project) {
        let selectedPlatform = taskConfig.selectedPlatform;
        if (!selectedPlatform) {
            Logger.getInstance().warn('Platform is not defined: starting of server suspended');
            return null;
        }
        let cordova = ProjectManager.getInstance().cordova;
        let platformPath = cordova.getPlatformPath(project.path, selectedPlatform.name);
        let serveStaticAssets = true;
        if (!platformPath) {
            Logger.getInstance().warn('PlatformPath is not defined: force disable publish of static assets');
            serveStaticAssets = false;
        }
        return {
            serveStaticAssets: serveStaticAssets,
            platformPath: platformPath,
            port: TaskUtils.getPlatformServerPort(selectedPlatform.name)
        };
    }
    static getPlatformServerPort(platform) {
        //TODO read from config
        if (platform === 'android') {
            return parseInt(atom.config.get('de-workbench.AndroidWSPort'));
        }
        else if (platform === 'ios') {
            return parseInt(atom.config.get('de-workbench.iOSWSPort'));
        }
        else if (platform === 'browser') {
            return parseInt(atom.config.get('de-workbench.BrowserWSPort'));
        }
    }
    static createUniqueTaskName(tasks, baseName) {
        let prefix = baseName ? baseName + "_Clone" : "Clone";
        let cname;
        let suffix = 0;
        do {
            suffix++;
            cname = `${prefix}_${suffix}`;
        } while (findIndex(tasks, (item) => {
            return item.name == cname;
        }) > 0);
        return cname;
    }
    static createCliOptions(taskConfig) {
        if (!taskConfig) {
            return null;
        }
        let cliParamsList = taskConfig.cliParams || [];
        let envVariables = taskConfig.envVariables || [];
        let cliOptions = {
            flags: [],
            envVariables: []
        };
        forEach(cliParamsList, (single) => {
            cliOptions.flags.push(single);
        });
        forEach(envVariables, (single) => {
            cliOptions.envVariables.push(single);
        });
        if (taskConfig.variantName) {
            cliOptions.envVariables.push({ name: CORDOVA_BUILD_VARIANT, value: taskConfig.variantName });
        }
        return cliOptions;
    }
}
//# sourceMappingURL=TaskUtils.js.map