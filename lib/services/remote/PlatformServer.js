'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Logger } from '../../logger/Logger';
import { EventEmitter } from 'events';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
const express = allowUnsafeEval(() => require('express'));
export class PlatformServerImpl {
    constructor() {
        this.sockets = {};
        this.events = new EventEmitter();
    }
    start(config) {
        this.initExpressApp(config);
        this.initHttp(config);
        this.initSocketIO(config);
    }
    initExpressApp(config) {
        Logger.getInstance().info("initExpressApp");
        allowUnsafeEval(() => { this.app = express(); });
        this.initExpressStaticServe(config);
        this.initInjectedFileServe(config);
    }
    initExpressStaticServe(config) {
        if (config.serveStaticAssets) {
            this.app.use(express.static(config.platformPath, null));
        }
    }
    initInjectedFileServe(config) {
        this.app.get('/__dedebugger/**', (req, res) => {
            var urlRelative = req.url;
            urlRelative = urlRelative.replace('/__dedebugger/', '/injectedfiles/');
            res.sendFile(__dirname + urlRelative);
        });
    }
    initHttp(config) {
        this.http = require('http').Server(this.app);
        this.http.on('connection', (socket) => {
            var socketId = PlatformServerImpl.nextSocketId++;
            this.sockets[socketId] = socket;
            console.log('socket', socketId, 'opened');
            socket.on('close', () => {
                console.log('socket', socketId, 'closed');
                delete this.sockets[socketId];
            });
            socket.setTimeout(config.connectionTimeout || 15000);
        });
        this.http.listen(config.port, () => {
            console.log(("App is running at http://localhost:%d "), config.port);
        });
    }
    initSocketIO(config) {
        this.io = require('socket.io')(this.http);
        this.io.on('connection', (socket) => {
            var address = socket.handshake.address;
            Logger.getInstance().debug("on debugger session connection for " + address);
            socket.on('disconnect', () => {
                Logger.getInstance().debug("Device disconnected: from " + address);
            });
            socket.on('deviceReady', (msg) => {
                Logger.getInstance().debug("onDevice Ready: " + JSON.stringify(msg));
                socket.deviceInfo = msg;
            });
            socket.on('close', (socket) => {
                Logger.getInstance().debug("socket closed");
            });
            socket.on('evalResult', (resultMessage) => {
                this.events.emit('didJSEvalResultReceived', resultMessage);
            });
        });
    }
    stop() {
        return new Promise((resolve, reject) => {
            if (this.http) {
                this.http.close(() => {
                    console.log("http closed");
                    this.http = null;
                    resolve();
                });
                for (let socketId in this.sockets) {
                    this.sockets[socketId].destroy();
                }
                this.sockets = {};
            }
            this.io = null;
            this.app = null;
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.stop();
            this.app = null;
        });
    }
    executeAction(action) {
        switch (action.type) {
            case "doLiveReload":
                this.io.emit("doLiveReload");
                return Promise.resolve();
            case "doEval":
                this.io.emit("doEval", {
                    id: action.id,
                    cmd: action.cmd
                });
                return Promise.resolve();
            default:
                Promise.reject({
                    ERROR_CODE: 'UNKNOWN_ACTION',
                    ERROR_MESSAGE: 'unknown action type' + action.type,
                });
        }
    }
    isRunning() {
        return this.http && this.http.listening;
    }
    addEventListener(event, listener) {
        this.events.addListener(event, listener);
    }
    removeEventListener(event, listener) {
        if (listener) {
            this.events.removeListener(event, listener);
        }
        else {
            this.events.removeAllListeners(event);
        }
    }
    static createNew() {
        return new PlatformServerImpl();
    }
}
PlatformServerImpl.nextSocketId = 0;
//# sourceMappingURL=PlatformServer.js.map