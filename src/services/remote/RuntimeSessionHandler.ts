'use babel'
import { PlatformServer, PlatformServerImpl, PlatformServerConfig,LiveActions } from './PlatformServer'
import { ConsumedServices } from '../../DEWorkbench/ConsumedServices'
import {Logger} from '../../logger/Logger'
const uuidv4 = require('uuid/v4');
export interface JSSession {
  getId():string
  execJSCommand(jsCommand:string):Promise<any>
  execJSCommandWithResult():Promise<any>
}


export class RuntimeSessionHandler {
  private platformServer:PlatformServer
  private consoleHandler:ConsoleHandler;

  constructor(srvConf:PlatformServerConfig){
    this.consoleHandler = new ConsoleHandler();
    this.createAndStartServer(srvConf);
  }

  private createAndStartServer(srvConf:PlatformServerConfig){
    this.platformServer = PlatformServerImpl.createNew();
    this.platformServer.start(srvConf);
  }

  static createRuntimeSession(srvConf:PlatformServerConfig):RuntimeSessionHandler{
    return new RuntimeSessionHandler(srvConf);
  }

  public canOpenJSSession():boolean{
    return this.isPlatformServerRunning();
  }

  isPlatformServerRunning():boolean{
    return this.platformServer && this.platformServer.isRunning();
  }

  public openJSSession():JSSession{
    if(!this.canOpenJSSession){
      return null;
    }
    return this.openSessionForJSCommands();
  }

  public openConsole():ConsoleHandler{
    let session:JSSession = this.openJSSession();
    if(session == null){
      return null;
    }
    this.consoleHandler.setSession(session);
    this.consoleHandler.openConsole();
    return this.consoleHandler;
  }

  private openSessionForJSCommands():JSSession{
    return new BaseJSSession(this.platformServer);
  }

  async stopServer(){
    /*if(this.platformServer){
      this.platformServer.stop().then(() => {
          Logger.getInstance().info("Server stop done");
      },() => {
        Logger.getInstance().error("Server stop fail");
      });
    }*/
    if(!this.platformServer){
      return Promise.resolve();
    }
    try{
      let result = await this.platformServer.stop();
      Logger.getInstance().info("Server stop done");
      return Promise.resolve();
    }catch(ex){
      Logger.getInstance().error("Server stop fail",ex);
      return Promise.reject(ex);
    }
  }

  public async sendAction(action:LiveActions) {
    await this.platformServer.executeAction(action);
    return Promise.resolve();
  }

}


class BaseJSSession implements JSSession{
  private server:PlatformServer;
  private sessionId:string
  constructor(server:PlatformServer){
    this.server = server;
    this.sessionId = uuidv4();
  }
  getId():string{
    return this.sessionId;
  }
  async execJSCommand(jsCommand:string):Promise<any>{
    let result= await this.server.executeAction({
      type :'doEval',
      cmd :jsCommand
    });
    return result;
  }

  execJSCommandWithResult():Promise<any>{
    //TODO
    return null;
  }
}


export class ConsoleHandler {
  private session:JSSession;
  private console:any

  public setSession(session:JSSession){
    this.session = session;
  }
  public openConsole(){
    this.createConsoleBridge();
    this.console.open({
      split: 'down',
      searchAllPanes: false
    })
  }

  private createConsoleBridge(){
    this.console = ConsumedServices.ink.Console.fromId('dewb-jssession-cmd-client')
    this.console.setModes([
      {name: 'DE Workbench JS Console', default: true, grammar: 'source.javascript'}
    ]);
    let cons = this.console;
    this.console.onEval((arg)=>{
      var editor = arg.editor;
      cons.logInput();
      cons.done();
      try {
        let textCmd = editor.getText();
        this.session.execJSCommand(textCmd).then(() => {
          cons.stdout("Command sent to client");
        });
        return cons.input();
      } catch (error){
        cons.stderr(error);
        return cons.input();
      }
    });
  }



}
