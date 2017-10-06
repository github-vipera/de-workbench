'use babel';
var winston = require('winston');
import { EventSupport } from '../utils/EventSupport';
import { GlobalPreferences } from '../DEWorkbench/GlobalPreferences';
const path = require("path");
export class Logger {
    constructor() {
        let filePath = path.join(GlobalPreferences.preferencesFolder, 'de_workbench.log');
        let filePathJSON = path.join(GlobalPreferences.preferencesFolder, 'de_workbench_json.log');
        this.logger = new (winston.Logger)({
            transports: [
                new winston.transports.File({
                    level: 'debug',
                    filename: filePath,
                    handleExceptions: true,
                    json: false,
                    maxsize: 5242880,
                    maxFiles: 5,
                    colorize: false
                }),
                new winston.transports.File({
                    level: 'debug',
                    name: 'log-buffer',
                    filename: filePathJSON,
                    handleExceptions: true,
                    json: true,
                    maxsize: 5242880,
                    maxFiles: 5,
                    colorize: false
                })
            ]
        });
        this.evtSupport = new EventSupport();
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    static getLoggerBufferFilePath() {
        return path.join(GlobalPreferences.preferencesFolder, 'de_workbench_json.log');
    }
    info(...msg) {
        this.fireLogEvent(LogLevel.INFO, msg);
        this.logger.info.apply(this, msg);
        Logger.consoleLog("", msg);
    }
    debug(...msg) {
        this.fireLogEvent(LogLevel.DEBUG, msg);
        this.logger.debug.apply(this, msg);
        Logger.consoleLog("", msg);
    }
    warn(...msg) {
        this.fireLogEvent(LogLevel.WARN, msg);
        this.logger.warn.apply(this, msg);
        Logger.consoleLog("", msg);
    }
    error(...msg) {
        this.fireLogEvent(LogLevel.ERROR, msg);
        this.logger.error.apply(this, msg);
        Logger.consoleLog("", msg);
    }
    fireLogEvent(level, ...msg) {
        this.evtSupport.fireEvent('logging', level, msg.join(' , '));
    }
    addLoggingListener(listener) {
        this.evtSupport.addEventListener((event, data) => {
            listener.onLogging(data[0], data[1]);
        });
    }
    static consoleLog(msg, ...params) {
        if (!Logger.CONSOLE_LOG_ENABLED) {
            return;
        }
        if (params && params.length > 0) {
            console.log(msg, params);
        }
        else {
            console.log(msg);
        }
    }
}
Logger.CONSOLE_LOG_ENABLED = true;
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["TRACE"] = 0] = "TRACE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
})(LogLevel || (LogLevel = {}));
//# sourceMappingURL=Logger.js.map