'use babel'
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const kill = require('tree-kill');
const path = require("path");
import { CommandExecutor } from '../utils/CommandExecutor'
import { Logger } from '../logger/Logger'
import {forEach} from 'lodash'
/**
 *
 * Class for run npm scripts
 */
export class ScriptExecutor extends CommandExecutor{
  constructor(){
    super(null);
  }
  async runNpmScript(name:string,basePath:string){
    let result = await this.runScriptImpl(name,basePath);
    return result;
  }
  async runNpmScripts(names:Array<string>,basePath:string){
    let lastRes;
    for(let name of names){
      lastRes = await this.runNpmScript(name,basePath);
    }
    return lastRes;
  }
  private async runScriptImpl(name:string,basePath:string){
    Logger.getInstance().info("runScriptImpl...");
    //var cmd = "cordova";
    var options = {
      cwd: basePath,
      detached: false
    };
    let cmd = this.prepareCommand("npm");
    let args = ["run",name];
    var operationLogTag = "Run npm scripts";
    this.spawnRef = spawn(cmd, args, options);
    return new Promise((resolve, reject) => {
      var operationResult = undefined;
      this.spawnRef.stdout.on('data', (data) => {
        Logger.getInstance().debug(`[${operationLogTag} progress]: ${data}`)
      });
      this.spawnRef.stderr.on('data', (data) => {
        Logger.getInstance().error("[Run] " + data.toString())
        console.error(`[${operationLogTag}]: ${data}`);
      });
      this.spawnRef.on('close', (code,signal) => {
        console.log(`[${operationLogTag}] child process exited with code ${code}`);
        Logger.getInstance().info(`[${operationLogTag}] child process exited with code ${code} and signal ${signal}`)
        this.spawnRef = undefined;
        if (code === 0) {
          resolve({
            "msg": `${operationLogTag} DONE`,
          });
        } else {
          reject(`${operationLogTag} FAIL`);
        }
      });
    });
  }

  public stop(){
    this.stopSpawn();
  }
}
