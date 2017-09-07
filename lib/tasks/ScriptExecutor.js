'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const kill = require('tree-kill');
const path = require("path");
import { CommandExecutor } from '../utils/CommandExecutor';
import { Logger } from '../logger/Logger';
/**
 *
 * Class for run npm scripts
 */
export class ScriptExecutor extends CommandExecutor {
    constructor() {
        super(null);
    }
    runNpmScript(name, basePath) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.runScriptImpl(name, basePath);
            return result;
        });
    }
    runNpmScripts(names, basePath, cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastRes;
            for (let name of names) {
                lastRes = yield this.runNpmScript(name, basePath);
            }
            return lastRes;
        });
    }
    runScriptImpl(name, basePath, cliOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger.getInstance().info("runScriptImpl...");
            //var cmd = "cordova";
            var options = {
                cwd: basePath,
                detached: false
            };
            let cmd = this.prepareCommand("npm");
            let args = ["run", name];
            var operationLogTag = "Run npm scripts";
            this.spawnRef = spawn(cmd, args, options);
            return new Promise((resolve, reject) => {
                var operationResult = undefined;
                this.spawnRef.stdout.on('data', (data) => {
                    Logger.getInstance().debug(`[${operationLogTag} progress]: ${data}`);
                });
                this.spawnRef.stderr.on('data', (data) => {
                    Logger.getInstance().error("[Run] " + data.toString());
                    console.error(`[${operationLogTag}]: ${data}`);
                });
                this.spawnRef.on('close', (code, signal) => {
                    console.log(`[${operationLogTag}] child process exited with code ${code}`);
                    Logger.getInstance().info(`[${operationLogTag}] child process exited with code ${code} and signal ${signal}`);
                    this.spawnRef = undefined;
                    if (code === 0) {
                        resolve({
                            "msg": `${operationLogTag} DONE`,
                        });
                    }
                    else {
                        reject(`${operationLogTag} FAIL`);
                    }
                });
            });
        });
    }
    stop() {
        this.stopSpawn();
    }
}
//# sourceMappingURL=ScriptExecutor.js.map