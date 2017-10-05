'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 var winston = require('winston');
import {EventSupport,EventSupportDelegate} from '../utils/EventSupport'
import { GlobalPreferences } from '../DEWorkbench/GlobalPreferences'

const path = require("path")

export class Logger {

  private static instance: Logger;

  private logger: any;
  private evtSupport:EventSupport;


  private constructor(){
    let filePath = path.join(GlobalPreferences.preferencesFolder, 'de_workbench.log')
    let filePathJSON = path.join(GlobalPreferences.preferencesFolder, 'de_workbench_json.log')
    this.logger = new (winston.Logger)({
      transports: [
        new winston.transports.File({
            level: 'debug',
            filename: filePath,
            handleExceptions: true,
            json: false,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.File({
            level: 'debug',
            name: 'log-buffer',
            filename: filePathJSON,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        })
        /**,
        new winston.transports.Console({
            level: 'verbose',
            handleExceptions: true,
            json: false,
            colorize: true
        })**/
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

  static getLoggerBufferFilePath(){
    return path.join(GlobalPreferences.preferencesFolder, 'de_workbench_json.log');
  }

  info(...msg:any[]){
    this.fireLogEvent(LogLevel.INFO,msg);
    this.logger.info.apply(this, msg);
    console.info(msg);
  }

  debug(...msg:any[]){
    this.fireLogEvent(LogLevel.DEBUG,msg);
    this.logger.debug.apply(this, msg);
    console.debug(msg);
  }

  warn(...msg:any[]){
    this.fireLogEvent(LogLevel.WARN,msg);
    this.logger.warn.apply(this, msg);
    console.warn(msg);
  }

  error(...msg:any[]){
    this.fireLogEvent(LogLevel.ERROR,msg);
    this.logger.error.apply(this, msg);
    console.error(msg);
  }



  private fireLogEvent(level:LogLevel,...msg){
    this.evtSupport.fireEvent('logging',level,msg.join(' , '));
  }

  addLoggingListener(listener:LoggerListener):void{
    this.evtSupport.addEventListener((event:string,data:any[]) => {
      listener.onLogging(data[0],data[1]);
    });
  }
}

export interface LoggerListener{
  onLogging(level:LogLevel, msg:string);
}

export enum LogLevel {
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
}
