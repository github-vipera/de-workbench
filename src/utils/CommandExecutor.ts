'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const kill = require('tree-kill');
const fse = require('fs-extra');
import { Logger } from '../logger/Logger'

export class CommandExecutor {

  protected isWin: boolean;
  protected basePath: string;
  protected spawnRef: any;

  constructor(path: string) {
    Logger.getInstance().debug("Creating CommandExecutor...");
    this.basePath = path;// != undefined ? path : atom.project["getPaths"]()[0];
    this.isWin = /^win/.test(process.platform);
  }

  prepareCommand(cmd: string) {
    if (this.isWin) {
      cmd = cmd + ".cmd";
    }
    return cmd;
  }

  getCmdOptions(path?:string,env?:any):any{
    let cmdOptions:any = {
        cwd: path || this.basePath,
        detached:false
    };
    if(env){
      cmdOptions.env = env;
    }
    return cmdOptions;
  }

  isBusy(): boolean {
    return this.spawnRef != undefined;
  }

  stopSpawn() {
    Logger.getInstance().debug("stop run Spawn")
    if (!this.spawnRef) {
      return;
    }
    kill(this.spawnRef.pid);
  }

  runExec(cmd: string): Promise<any> {
    Logger.getInstance().info("execOperationWithExec cmd:", cmd);
    return new Promise((resolve, reject) => {
      let options = this.getCmdOptions();
      exec(cmd, options, (error, stdout, stderr) => {
        if (error) {
          Logger.getInstance().error("execOperationWithExec error: ", error);
          reject(error);
          return;
        }
        Logger.getInstance().debug("exec prepare done");
        resolve(stdout);
      });
    });
  }

  runSpawn(command:string, args:any, operationLogTag:any, withResult:any):Promise<any> {
    Logger.getInstance().info("execOperationWithSpawn args:", args);
    //var cmd = "cordova";
    var options = {
      cwd: this.basePath,
      detached: false
    };
    let cmd = this.prepareCommand(command);
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve, reject) => {
      var operationResult = undefined;
      this.spawnRef.stdout.on('data', (data) => {
        if (withResult && data && data.toString() != "\n") {
          operationResult = data.toString();
        }
        Logger.getInstance().debug(`[${operationLogTag} progress]: ${data}`)
        Logger.consoleLog(`[${operationLogTag} progress]: ${data}`);
      });

      this.spawnRef.stderr.on('data', (data) => {
        Logger.getInstance().error("[Run] " + data.toString())
        console.error(`[${operationLogTag}]: ${data}`);
      });

      this.spawnRef.on('close', (code) => {
        Logger.consoleLog(`[${operationLogTag}] child process exited with code ${code}`);
        Logger.getInstance().info(`[${operationLogTag}] child process exited with code ${code}`)
        this.spawnRef = undefined;
        if (code === 0) {
          resolve({
            "msg": `${operationLogTag} DONE`,
            "operationResult": operationResult
          });
        } else {
          reject(`${operationLogTag} FAIL`);
        }
      });
    });
  }



}
