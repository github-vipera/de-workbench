'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { EventBus } from '../../DEWorkbench/EventBus';
import { APNService } from './APNService';
import { GCMService } from './GCMService';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
const express = allowUnsafeEval(() => require('express'));
export var PushPlatform;
(function (PushPlatform) {
    PushPlatform["APN"] = "apn";
    PushPlatform["GCM"] = "gcm";
})(PushPlatform || (PushPlatform = {}));
export class PushService {
    static get EVT_PUSH_NOTIFICATION_SENT() { return "dewb.pushtool.messageSent"; }
    constructor() {
        this.initPlatformServices();
    }
    initPlatformServices() {
        this.platforms = {};
        let apn = new APNService();
        this.platforms["apn"] = apn;
        let gcm = new GCMService();
        this.platforms["gcm"] = gcm;
    }
    sendPushMessage(message, platform, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let pushSender = this.getSenderService(platform);
            let platformConfig = this.getConfigForPlatform(options, platform);
            if (pushSender) {
                try {
                    pushSender.initialize(platformConfig);
                    yield pushSender.sendPushMessage(message);
                    EventBus.getInstance().publish(PushService.EVT_PUSH_NOTIFICATION_SENT, message);
                }
                catch (ex) {
                    throw ('Error sending message: ' + ex);
                }
            }
            else {
                throw ('No sender found for ' + platform + '');
            }
        });
    }
    getConfigForPlatform(options, platform) {
        if (platform === PushPlatform.APN) {
            return options.apn;
        }
        else if (platform === PushPlatform.GCM) {
            return options.gcm;
        }
    }
    getSenderService(platform) {
        return this.platforms[platform.toString()];
    }
}
//# sourceMappingURL=PushService.js.map