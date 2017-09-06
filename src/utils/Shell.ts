'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { Logger } from '../logger/Logger'

const _electron = require('electron')

export class Shell {

    private static instance: Shell;

    private constructor() {
    }

    static getInstance() {
        if (!Shell.instance) {
            Shell.instance = new Shell();
        }
        return Shell.instance;
    }

    public static openExternal(url:string):boolean{
      return _electron.shell.openExternal(url)
    }

    public static beep(){
      _electron.shell.beep()
    }

}
