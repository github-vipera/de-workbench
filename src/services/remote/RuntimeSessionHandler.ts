'use babel'
import { PlatformServer, PlatformServerImpl, PlatformServerConfig,LiveActions } from './PlatformServer'
import { ConsumedServices } from '../../DEWorkbench/ConsumedServices'
import {Logger} from '../../logger/Logger'
import {EventEmitter} from 'events'
const uuidv4 = require('uuid/v4');

export interface JSSession {
  getId():string
  execJSCommand(jsCommand:string):Promise<any>
  didJSResultReceived(listener: (...args:any[]) => void):void
  close();
}


export class RuntimeSessionHandler {
  private platformServer:PlatformServer
  private consoleHandler:ConsoleHandler;
  private events:EventEmitter;

  constructor(srvConf:PlatformServerConfig){
    this.events = new EventEmitter();
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
      this.consoleHandler.close();
      this.consoleHandler = null;
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
  private callback:any
  private events:EventEmitter

  constructor(server:PlatformServer){
    this.server = server;
    this.sessionId = uuidv4();
    this.events = new EventEmitter();
    this.attachSessionListeners();
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

  private attachSessionListeners(){
    this.callback = this.onJSCommandResult.bind(this);
    this.server.addEventListener('didJSEvalResultReceived',this.callback);
  }

  private onJSCommandResult(result){
    Logger.getInstance().debug('Receive result',JSON.stringify(result));
    this.events.emit('didJSEvalResultReceived',result);
  }

  close(){
    this.server.removeEventListener('didJSEvalResultReceived',this.callback);
    this.events.removeAllListeners();
  }

  didJSResultReceived(listener){
    this.events.addListener('didJSEvalResultReceived',listener);
  }
}


export class ConsoleHandler {
  private session:JSSession;
  private console:any
  public setSession(session:JSSession){
    this.session = session;
    this.session.didJSResultReceived((message) => {
      this.console.log();
      this.console.done();
      if(this.console){
        if(message.status == "OK"){
          this.console.stdout(message.evalRes);
        }
        else{
          this.console.stderr("Error: " + JSON.stringify(message.err));
        }
      }
      this.console.input();
    });
  }
  public openConsole(){
    if(!this.console){
      this.createConsoleBridge();
    }
    this.console.open({
      split: 'down',
      searchAllPanes: false
    })
  }

  private createConsoleBridge(){
    this.console = ConsumedServices.ink.Console.fromId('dewb-jssession-cmd-client')
    Logger.consoleLog("console",this.console)
    this.console.setModes([
      {name: 'DE Workbench JS Console', default: true, grammar: 'source.javascript'}
    ]);
    this.console.onEval(this.onCmdEval.bind(this));
  }

  private onCmdEval(arg){
    var editor = arg.editor;
    try {
      let textCmd = editor.getText();
      this.session.execJSCommand(textCmd).then(() => {
        Logger.getInstance().debug('Js command send to session',this.session.getId());
      },(err) => {
        this.console.stderr("Error: " + JSON.stringify(err));
      });
    } catch (error){
      this.console.stderr(error);
      return this.console.input();
    }
  }
  public close(){
    if(this.console){
      Logger.consoleLog('clear emitter');
      this.console.emitter.off('eval',this.onCmdEval);
      delete this.console.emitter.handlersByEventName.eval;
      this.console.close();
    }
    this.session.close()
    this.session = null;
    this.console = null;
  }

}
