'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { PlatformServerImpl } from './PlatformServer';
import { ConsumedServices } from '../../DEWorkbench/ConsumedServices';
import { Logger } from '../../logger/Logger';
import { EventEmitter } from 'events';
const uuidv4 = require('uuid/v4');
export class RuntimeSessionHandler {
    constructor(srvConf) {
        this.events = new EventEmitter();
        this.consoleHandler = new ConsoleHandler();
        this.createAndStartServer(srvConf);
    }
    createAndStartServer(srvConf) {
        this.platformServer = PlatformServerImpl.createNew();
        this.platformServer.start(srvConf);
    }
    static createRuntimeSession(srvConf) {
        return new RuntimeSessionHandler(srvConf);
    }
    canOpenJSSession() {
        return this.isPlatformServerRunning();
    }
    isPlatformServerRunning() {
        return this.platformServer && this.platformServer.isRunning();
    }
    openJSSession() {
        if (!this.canOpenJSSession) {
            return null;
        }
        return this.openSessionForJSCommands();
    }
    openConsole() {
        let session = this.openJSSession();
        if (session == null) {
            return null;
        }
        this.consoleHandler.setSession(session);
        this.consoleHandler.openConsole();
        return this.consoleHandler;
    }
    openSessionForJSCommands() {
        return new BaseJSSession(this.platformServer);
    }
    stopServer() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.platformServer) {
                return Promise.resolve();
            }
            try {
                let result = yield this.platformServer.stop();
                Logger.getInstance().info("Server stop done");
                this.consoleHandler.close();
                this.consoleHandler = null;
                return Promise.resolve();
            }
            catch (ex) {
                Logger.getInstance().error("Server stop fail", ex);
                return Promise.reject(ex);
            }
        });
    }
    sendAction(action) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.platformServer.executeAction(action);
            return Promise.resolve();
        });
    }
}
class BaseJSSession {
    constructor(server) {
        this.server = server;
        this.sessionId = uuidv4();
        this.events = new EventEmitter();
        this.attachSessionListeners();
    }
    getId() {
        return this.sessionId;
    }
    execJSCommand(jsCommand) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.server.executeAction({
                type: 'doEval',
                cmd: jsCommand
            });
            return result;
        });
    }
    attachSessionListeners() {
        this.callback = this.onJSCommandResult.bind(this);
        this.server.addEventListener('didJSEvalResultReceived', this.callback);
    }
    onJSCommandResult(result) {
        Logger.getInstance().debug('Receive result', JSON.stringify(result));
        this.events.emit('didJSEvalResultReceived', result);
    }
    close() {
        this.server.removeEventListener('didJSEvalResultReceived', this.callback);
        this.events.removeAllListeners();
    }
    didJSResultReceived(listener) {
        this.events.addListener('didJSEvalResultReceived', listener);
    }
}
export class ConsoleHandler {
    setSession(session) {
        this.session = session;
        this.session.didJSResultReceived((message) => {
            this.console.done();
            if (this.console) {
                if (message.status == "OK") {
                    this.console.stdout(message.evalRes);
                }
                else {
                    this.console.stderr("Error: " + JSON.stringify(message.err));
                }
            }
            this.console.input();
        });
    }
    openConsole() {
        if (!this.console) {
            this.createConsoleBridge();
        }
        this.console.open({
            split: 'down',
            searchAllPanes: false
        });
    }
    createConsoleBridge() {
        this.console = ConsumedServices.ink.Console.fromId('dewb-jssession-cmd-client');
        Logger.consoleLog("console", this.console);
        this.console.setModes([
            { name: 'DE Workbench JS Console', default: true, grammar: 'source.javascript' }
        ]);
        this.console.onEval(this.onCmdEval.bind(this));
    }
    onCmdEval(arg) {
        var editor = arg.editor;
        try {
            let textCmd = editor.getText();
            this.session.execJSCommand(textCmd).then(() => {
                Logger.getInstance().debug('Js command send to session', this.session.getId());
            }, (err) => {
                this.console.stderr("Error: " + JSON.stringify(err));
            });
        }
        catch (error) {
            this.console.stderr(error);
            return this.console.input();
        }
    }
    close() {
        if (this.console) {
            Logger.consoleLog('clear emitter');
            this.console.emitter.off('eval', this.onCmdEval);
            delete this.console.emitter.handlersByEventName.eval;
            this.console.close();
        }
        this.session.close();
        this.session = null;
        this.console = null;
    }
}
//# sourceMappingURL=RuntimeSessionHandler.js.map