'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../logger/Logger'
import { CommandExecutor } from '../utils/CommandExecutor'

export class DEUtils {


  /**
   * Returns TRUE if the DE CLI seems to be available
   */
  public static async checkForDECli(){
    Logger.consoleLog("checkForDECli");
    let cmdExc = new CommandExecutor('.');
    try {
      let x = await cmdExc.runExec('de-cli');
      return true;
    } catch (ex){
      return false;
    }
  }

  /**
   * installs globally the DE CLI
   */
  public static async installDECli(){
    Logger.getInstance().info("Installing the DE CLI...");
    let cmdExc = new CommandExecutor('.');
    try {
      let x = await cmdExc.runExec('npm install -g vipera-de-cli');
      Logger.getInstance().info("DE CLI installed successfully.");
      return true;
    } catch (ex){
      Logger.getInstance().info("DE CLI installation failure: " + ex);
      return false;
    }
  }

}
