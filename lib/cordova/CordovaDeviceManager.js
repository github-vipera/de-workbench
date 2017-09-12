'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CordovaExecutor } from './CordovaExecutor';
import { map } from 'lodash';
export class CordovaDeviceManager {
    constructor(projectPath) {
        this.cordovaExecutor = null;
        this.cordovaExecutor = new CordovaExecutor(projectPath);
    }
    getDeviceList(platform) {
        return __awaiter(this, void 0, void 0, function* () {
            let devices = yield this.cordovaExecutor.getAllDeviceByPlatform(platform);
            if (devices) {
                return map(devices, (single) => {
                    return {
                        targetId: single,
                        name: single
                    };
                });
            }
            return null;
        });
    }
}
//# sourceMappingURL=CordovaDeviceManager.js.map