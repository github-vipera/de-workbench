'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CommandExecutor } from '../../utils/CommandExecutor';
export class ExecutorService {
    constructor() {
    }
    static getInstance() {
        if (!ExecutorService.instance) {
            ExecutorService.instance = new ExecutorService();
        }
        return ExecutorService.instance;
    }
    runExec(path, command) {
        return __awaiter(this, void 0, void 0, function* () {
            let cmdExc = new CommandExecutor(path);
            return cmdExc.runExec(command);
        });
    }
}
//# sourceMappingURL=ExecutorService.js.map