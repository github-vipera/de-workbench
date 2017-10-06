'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from '../logger/Logger';
import { CommandExecutor } from '../utils/CommandExecutor';
export class DEUtils {
    static checkForDECli() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger.consoleLog("checkForDECli");
            let cmdExc = new CommandExecutor('.');
            try {
                let x = yield cmdExc.runExec('de-cli');
                return true;
            }
            catch (ex) {
                return false;
            }
        });
    }
    static installDECli() {
        return __awaiter(this, void 0, void 0, function* () {
            Logger.getInstance().info("Installing the DE CLI...");
            let cmdExc = new CommandExecutor('.');
            try {
                let x = yield cmdExc.runExec('npm install -g vipera-de-cli');
                Logger.getInstance().info("DE CLI installed successfully.");
                return true;
            }
            catch (ex) {
                Logger.getInstance().info("DE CLI installation failure: " + ex);
                return false;
            }
        });
    }
}
//# sourceMappingURL=DEUtils.js.map