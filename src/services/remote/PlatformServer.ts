'use babel'
import * as express from "express";
import {Logger} from '../../logger/Logger'

export interface LiveActions{
  type:string
  [name:string]:any
}

export interface PlatformServerConfig {
  platformPath: string
  connectionTimeout?: number
  port: number
}

export interface PlatformServer {
  start(config: PlatformServerConfig): void
  stop(): Promise<any>
  clear(): Promise<any>
  executeAction(action:LiveActions):Promise<any>
}

export class PlatformServerImpl implements PlatformServer {
  private static nextSocketId: number = 0;
  app: express.Application;
  io:any
  http: any
  sockets = {};
  config: PlatformServerConfig
  constructor() {

  }

  public start(config: PlatformServerConfig) {
    this.initExpressApp(config);
    this.initHttp(config);
    this.initSocketIO(config);
  }

  private initExpressApp(config: PlatformServerConfig): void {
    Logger.getInstance().info("initExpressApp");
    this.app = express();
    this.app.use(express.static(config.platformPath, null));
    this.app.get('/__dedebugger/**', (req, res) => {
        var urlRelative = req.url;
        urlRelative = urlRelative.replace('/__dedebugger/', '/injectedfiles/');
        res.sendFile(__dirname + urlRelative);
    });

  }

  private initHttp(config: PlatformServerConfig) {
    this.http = require('http').Server(this.app);
    this.http.on('connection', (socket) => {
      // Add a newly connected socket
      var socketId = PlatformServerImpl.nextSocketId++;
      this.sockets[socketId] = socket;
      console.log('socket', socketId, 'opened');

      // Remove the socket when it closes
      socket.on('close', () => {
        console.log('socket', socketId, 'closed');
        delete this.sockets[socketId];
      });

      socket.setTimeout(config.connectionTimeout || 15000);
    });

    this.http.listen(config.port, () => {
      console.log(("App is running at http://localhost:%d "), config.port)
    });
  }

  private initSocketIO(config: PlatformServerConfig) {
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
    });
  }

  public stop():Promise<any> {
    return new Promise((resolve,reject) => {
      if (this.http) {
        this.http.close(() => {
          console.log("http closed");
          this.http = null;
          resolve();
        })
        for (let socketId in this.sockets) {
          this.sockets[socketId].destroy();
        }
        this.sockets = {}
      }
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
        this.io.emit("doEval",action.cmd);
        return Promise.resolve();
      default:
        Promise.reject({
          ERROR_CODE: 'UNKNOWN_ACTION',
          ERROR_MESSAGE: 'unknown action type' + action.type,
        })
    }
  }

  public static createNew():PlatformServer{
    return new PlatformServerImpl();
  }
}
