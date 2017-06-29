'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 var winston = require('winston');


export class Logger {

  private static instance: Logger;

  private logger: any;


  private constructor(){
    this.logger = new (winston.Logger)({
      transports: [
        new winston.transports.File({
            level: 'verbose',
            filename: '/Users/marcobonati/Develop/sources/Vipera/DynamicEngine2/Tools/de-workbench/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'verbose',
            handleExceptions: true,
            json: false,
            colorize: true
        })
      ]
    });
  }

  static getInstance() {
      if (!Logger.instance) {
          Logger.instance = new Logger();
      }
      return Logger.instance;
  }

  info(...msg){
    this.logger.info(msg);
  }

  debug(...msg){
    this.logger.debug(msg);
  }

  error(...msg){
    this.logger.error(msg);
  }

}
