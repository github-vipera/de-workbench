'use babel'
//import * as express from "express";
import { Logger } from '../../logger/Logger'
import { EventEmitter } from 'events'
import { DEWBResourceManager } from '../../DEWorkbench/DEWBResourceManager'

const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const express = allowUnsafeEval(() => require('express'));
const path = require('path');

export interface LiveActions{
  type:string
  [name:string]:any
}

export interface PlatformServerConfig {
  serveStaticAssets:boolean
  platformPath: string
  port: number
  connectionTimeout?: number
}

export interface PlatformServer {
  start(config: PlatformServerConfig): void
  stop(): Promise<any>
  clear(): Promise<any>
  addEventListener(event:string,listener:(...args:any[]) => void): void
  removeEventListener(event:string,listener?:(...args:any[]) => void): void
  executeAction(action:LiveActions):Promise<any>
  isRunning():boolean
}

export class PlatformServerImpl implements PlatformServer {
  private static nextSocketId: number = 0;
  protected app: any;
  protected io:any
  protected http: any
  protected sockets = {};
  protected config: PlatformServerConfig
  protected events:EventEmitter
  constructor() {
    this.events = new EventEmitter();
  }

  public start(config: PlatformServerConfig) {
    this.initExpressApp(config);
    this.initHttp(config);
    this.initSocketIO(config);
  }

  private initExpressApp(config: PlatformServerConfig): void {
    Logger.getInstance().info("initExpressApp");
    allowUnsafeEval(() => {this.app = express()})
    this.initExpressStaticServe(config);
    this.initInjectedFileServe(config)
  }

  protected initExpressStaticServe(config: PlatformServerConfig):void{
    if(config.serveStaticAssets){
      this.app.use(express.static(config.platformPath, null));
    }
  }

  protected initInjectedFileServe(config: PlatformServerConfig):void{
    this.app.get('/__dedebugger/**', (req, res) => {
        var urlRelative = req.url;
        Logger.getInstance().info("require debugger resource: " + urlRelative);

        //urlRelative = urlRelative.replace('/__dedebugger/', '/injectedfiles/');
        //res.sendFile(__dirname + urlRelative);
        urlRelative = urlRelative.replace('/__dedebugger/',"");
        let resPath = DEWBResourceManager.getResourcePath('injectedfiles/');
        resPath = path.join(resPath,urlRelative);
        Logger.getInstance().info("completePath ",resPath);
        res.sendFile(resPath);
    });
  }


  private initHttp(config: PlatformServerConfig):void {
    this.http = require('http').Server(this.app);
    this.http.on('connection', (socket) => {
      // Add a newly connected socket
      var socketId = PlatformServerImpl.nextSocketId++;
      this.sockets[socketId] = socket;
      Logger.consoleLog('socket', socketId, 'opened');

      // Remove the socket when it closes
      socket.on('close', () => {
        Logger.consoleLog('socket', socketId, 'closed');
        delete this.sockets[socketId];
      });

      socket.setTimeout(config.connectionTimeout || 15000);
    });

    this.http.listen(config.port, () => {
      Logger.consoleLog(("App is running at http://localhost:%d "), config.port)
    });
  }

  private initSocketIO(config: PlatformServerConfig):void {
    this.io = require('socket.io')(this.http);
    this.io.on('connection', (socket) => {
        var address = socket.handshake.address;
        Logger.getInstance().debug("on debugger session connection for " + address);

        socket.on('disconnect', () => {
            Logger.getInstance().debug("Device disconnected: from " + address);
            //this.socketList.splice(this.socketList.indexOf(socket), 1);
        });

        socket.on('deviceReady', (msg) => { //????
            Logger.getInstance().debug("onDevice Ready: " + JSON.stringify(msg));
            socket.deviceInfo = msg;
        });

        socket.on('close', (socket) => {
            //socket.destroy();
            Logger.getInstance().debug("socket closed");
        });

        socket.on('evalResult',(resultMessage) => {
           this.events.emit('didJSEvalResultReceived',resultMessage);
        });
    });
  }

  public stop():Promise<any> {
    return new Promise((resolve,reject) => {
      if (this.http) {
        this.http.close(() => {
          Logger.consoleLog("http closed");
          this.http = null;
          resolve();
        })
        for (let socketId in this.sockets) {
          this.sockets[socketId].destroy();
        }
        this.sockets = {}
      }
      this.io = null;
      this.app = null;
    });
  }

  public async clear() {
    await this.stop();
    this.app = null;
  }

  public executeAction(action:LiveActions):Promise<any> {
    switch (action.type) {
      case "doLiveReload":
        this.io.emit("doLiveReload");
        return Promise.resolve();
      case "doEval":
        this.io.emit("doEval",{
          id:action.id,
          cmd:action.cmd
        });
        return Promise.resolve();
      default:
        Promise.reject({
          ERROR_CODE: 'UNKNOWN_ACTION',
          ERROR_MESSAGE: 'unknown action type' + action.type,
        })
    }
  }

  public isRunning():boolean{
    return this.http && this.http.listening
  }

  public addEventListener(event:string,listener:(...args:any[]) => void){
    this.events.addListener(event,listener);
  }

  public removeEventListener(event:string,listener?:(...args:any[]) => void){
    if(listener){
      this.events.removeListener(event,listener);
    }else{
      this.events.removeAllListeners(event)
    }
  }


  public static createNew():PlatformServer{
    return new PlatformServerImpl();
  }

}
