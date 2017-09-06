'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 export interface CallStackFrame {
  name: string,
  columnNumber: number,
  lineNumber: number,
  filePath: string
}

export type CallStackFrames = Array<CallStackFrame>

export interface Breakpoint {
  lineNumber: number,
  filePath: string,
  condition: string,
  marker: any
}

export type Breakpoints = Array<Breakpoint>
