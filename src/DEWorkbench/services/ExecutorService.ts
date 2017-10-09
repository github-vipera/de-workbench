'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../../logger/Logger'
import { EventBus } from '../EventBus'
import { GlobalPreferences } from '../GlobalPreferences'
import { UINotifications } from '../../ui-components/UINotifications'
import { CommandExecutor } from '../../utils/CommandExecutor'

export class ExecutorService {

  private static instance:ExecutorService;

  private constructor(){
  }

  static getInstance() {
      if (!ExecutorService.instance) {
          ExecutorService.instance = new ExecutorService();
      }
      return ExecutorService.instance;
  }

  public async runExec(path:string, command:string) {
    let cmdExc = new CommandExecutor(path);
    return cmdExc.runExec(command);
  }

}
