'use babel';
import { Logger } from '../../logger/Logger';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
const gcm = allowUnsafeNewFunction(() => allowUnsafeEval(() => require('node-gcm')));
export class GCMService {
    constructor() {
        this.ready = false;
    }
    initialize(configuration) {
        this.ready = true;
        this.configuration = configuration;
    }
    sendPushMessage(message) {
        return new Promise((resolve, reject) => {
            Logger.getInstance().debug("Sending to GCM...Data: " + JSON.stringify(message));
            if (!this.ready) {
                Logger.getInstance().warn("sendPush fail: gcm Provider is undefined");
                return;
            }
            var gcmMessage = this.toGCMNotification(message);
            var recipients = message.recipients;
            Logger.getInstance().debug("GCM message: " + JSON.stringify(message));
            var sender = new gcm.Sender(this.configuration.apikey);
            try {
                sender.sendNoRetry(gcmMessage, { registrationTokens: recipients }, function (err, response) {
                    if (err) {
                        Logger.getInstance().error("Error sending GCM notification: " + err);
                        reject(err);
                    }
                    else {
                        resolve("GCM message sent: " + response);
                    }
                });
            }
            catch (ex) {
                reject(ex);
            }
        });
    }
    toGCMNotification(pushData) {
        let message = new gcm.Message();
        if (pushData.alert) {
            message.addData('title', pushData.alert);
        }
        if (pushData.title) {
            message.addData('title', pushData.title);
        }
        if (pushData.body) {
            message.addData('body', pushData.body);
        }
        if (pushData.icon) {
            message.addData('icon', pushData.icon);
        }
        if (pushData.badge) {
            message.addData('badge', pushData.badge);
        }
        if (pushData.sound) {
            message.addData('sound', pushData.sound);
        }
        if (pushData.payload) {
            message.addData('payload', pushData.payload);
        }
        return message;
    }
    isReady() {
        return this.ready;
    }
}
//# sourceMappingURL=GCMService.js.map