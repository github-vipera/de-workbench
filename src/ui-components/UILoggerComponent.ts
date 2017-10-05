'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
 import {
   createText,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor
 } from '../element/index';

import { UIComponent, UIBaseComponent } from './UIComponent'
import { UIToolbar, UIToolbarButton } from './UIToolbar'
import { UIListViewModel } from 'UIListView'
import * as _ from 'lodash'
import {LogLevel} from '../logger/Logger'
import {UISelect, UISelectItem, UISelectListener} from './UISelect';
import {EventEmitter} from 'events'
const moment = require('moment')
const Tail = require('tail').Tail;
const {
    allowUnsafeEval,
    allowUnsafeNewFunction
} = require('loophole');

const lineReader = require('reverse-line-reader');
const ResizeObserver = require('resize-observer-polyfill');
const Terminal = require('xterm');
Terminal.loadAddon('fit');

export interface LogLine{
  logLevel:LogLevel
  message:string
  timestamp:string
}
export interface LogModelListener{
  rowAppended(newLine:LogLine):void
  rowDropped(logLine:LogLine,index?:number):void
  rowsChanged():void
}

export interface LogModel {
  appendLogLine(logLine:LogLine):void
  getRowAt(index:number): LogLine
  getRowCount():number
  addListener(listener:LogModelListener):void
  removeListener(listener:LogModelListener):void
  clear():void
}

export class BaseLogModel implements LogModel{
  private listeners:Array<LogModelListener> = [];
  private logLines:Array<LogLine> = [];
  private maxLineCount:number = 500;
  public constructor (maxLineCount?:number){
    if(maxLineCount){
      this.maxLineCount = maxLineCount;
    }
  }
  appendLogLine(logLine:LogLine):void {
    this.logLines.push(logLine);
    if(this.logLines.length > this.maxLineCount){
      let logLine = this.logLines[0];
      this.logLines = _.drop(this.logLines);
      this.fireRowDrop(logLine);
    }
    this.fireRowAdd(logLine);
  }
  getRowCount():number{
    return this.logLines.length;
  }
  getRowAt(index:number){
    return this.logLines[index];
  }
  addListener(listener:LogModelListener){
    this.listeners.push(listener);
  }
  removeListener(listener:LogModelListener):void{
    _.remove(this.listeners,function(single){
      return single == listener;
    });
  }
  clear():void{
    this.logLines = [];
    this.fireRowChanges();
  }
  fireRowAdd(logLine:LogLine){
    _.forEach(this.listeners,function(list){
      list.rowAppended(logLine)
    });
  }
  fireRowDrop(logLine:LogLine,index?:number){
    _.forEach(this.listeners,function(list){
      list.rowDropped(logLine,index || 0);
    });
  }
  fireRowChanges(){
    _.forEach(this.listeners,function(list){
      list.rowsChanged();
    });
  }
}

export interface Filter<T>{
  evaluateFilter(value:T):boolean
}

export interface IFilterableModel{
  addFilter(filter: Filter<LogLine>)
  removeFilter(filter: Filter<LogLine>)
  clearAllFilters()
  evaluateAllFilters()
}

export class FilterableLogModel extends BaseLogModel implements IFilterableModel,LogModelListener  {
  private model:LogModel;
  private _listeners:Array<LogModelListener> = [];
  private _logLines:Array<LogLine> = [];
  private _filters:Array<Filter<LogLine>>=[]
  private _filteredList:Array<LogLine>=[]
  constructor(model:LogModel){
    super();
    this.model=model;
    this.model.addListener(this);
  }
  appendLogLine(logLine:LogLine):void {
    this.model.appendLogLine(logLine);
  }

  getRowCount():number{
    if(this._filters.length>0){
      return this._filteredList.length;
    }
    return this.model.getRowCount();
  }

  getRowAt(index:number){
    if(this._filters.length>0){
      return this._filteredList[index];
    }
    return this.model.getRowAt(index);
  }

  addListener(listener:LogModelListener){
    this._listeners.push(listener);
  }

  removeListener(listener:LogModelListener):void{
    _.remove(this._listeners,function(single){
      return single == listener;
    });
  }

  rowAppended(logLine:LogLine){
    let newValue = this.applyFilterChain([logLine]);
    if(newValue.length>0){
      this._filteredList.push(newValue[0]);
      _.forEach(this._listeners,function(single){
        single.rowAppended(logLine);
      });
    }
    // ELSE do nothing!!!!
  }

  rowDropped(line:LogLine){
    let update:boolean = this.applyFilterChain([line]).length > 0;
    if(update){
      this._filteredList = _.drop(this._filteredList);
      _.forEach(this._listeners,function(single){
        single.rowDropped(line);
      });
    }
  }

  clear(){
    this.model.clear();
  }

  rowsChanged(){
    this.evaluateAllFilters();
  }

  addFilter(filter: Filter<LogLine>){
    this._filters.push(filter);
    this.evaluateAllFilters();
  }
  removeFilter(filter: Filter<LogLine>){
    _.remove(this._filters,function(single){
      return single == filter;
    });
  }
  clearAllFilters(){
    this._filters = [];
  }
  evaluateAllFilters(){
    this._filteredList=this.applyFilterChain(this.getOrigialValues());
    _.forEach(this._listeners,function(single){
      single.rowsChanged();
    });
  }

  private getOrigialValues():Array<LogLine>{
    let values=[];
    let count = this.model.getRowCount();
    for(let i=0; i< count; i++){
      values.push(this.model.getRowAt(i))
    }
    return values;
  }

  private applyFilterChain(currentValues:Array<LogLine>):Array<LogLine>{
    if(this._filters.length == 0){
      return currentValues;
    }
    for(let filter of this._filters){
      currentValues = _.filter(currentValues,filter.evaluateFilter.bind(filter));
    }
    return currentValues;
  }
}

const LOG_LEVEL_CONVERSION_MAP = {
  'trace':LogLevel.TRACE,
  'debug':LogLevel.DEBUG,
  'info':LogLevel.INFO,
  'warn':LogLevel.WARN,
  'error':LogLevel.ERROR
};

export class FileTailLogModel extends BaseLogModel {

  private filePath:string;
  private events:EventEmitter
  private tail
  constructor(filePath:string,lastLine?:number){
    super();
    this.events= new EventEmitter();
    this.filePath = filePath;
    if(lastLine>0){
      var count=0;
      var lastLines:Array<LogLine>=[];
      lineReader.eachLine(this.filePath, (line, last) => {
        console.log(line);
        try{
          lastLines.unshift(this.createLogLine(JSON.parse(line)));
        }catch(err){
        }
        count++;
        if (count >= lastLine) {
          _.forEach(lastLines,(line:LogLine) => {
            this.appendLogLine(line);
          });
          this.attachTailToFile();
          return false; // stop reading
        }
      });
    }else{
      this.attachTailToFile();
    }

  }

  private createAndAddLogLine(data){
    //console.log('createAndAddLogLine');
    let msg = this.cleanMessage(data.message);
    let logLevelStr = data["level"];
    let timestamp = data["timestamp"];
    this.appendLogLine({
      logLevel: this.convertToLogLevel(logLevelStr),
      message: msg,
      timestamp: timestamp
    });
  }

  private createLogLine(data):LogLine{
    let msg = this.cleanMessage(data.message);
    let logLevelStr = data["level"];
    let timestamp = data["timestamp"];
    return {
      logLevel: this.convertToLogLevel(logLevelStr),
      message: msg,
      timestamp: timestamp
    }
  }

  private cleanMessage(msg:string):string {
    //return msg.replace(/\n$/, "");
    return msg.replace(/(\r\n|\n|\r)/gm,"");
  }

  private convertToLogLevel(logLevelStr:string):LogLevel{
    return LOG_LEVEL_CONVERSION_MAP[logLevelStr] || LogLevel.TRACE;
  }

  private attachTailToFile(){
    this.tail = new Tail(this.filePath);
    this.tail.on("line", (data) => {
      this.createAndAddLogLine(JSON.parse(data));
    });

    this.tail.on("error", (error) => {
      console.log("LOG_TAIL_ERROR:",error);
      this.events.emit('didLogTailError',error);
    });
  }

  destroy(){
    this.tail.unwatch();
    this.tail = null;
  }
}



/***************************************************************
   View (UI) section

 ***************************************************************/

export class UILogView extends UIBaseComponent implements LogModelListener {
  private model:LogModel;
  private autoscroll:boolean = true;
  private terminal:any
  constructor(model?:LogModel){
    super();
    this.model=model != null? model:new BaseLogModel();
    this.model.addListener(this);
    this.initUI();
  }
  private initUI(){
    this.mainElement = createElement('de-workbench-terminal-view',{
      className: "de-workbench-uilogger-loglines"
    });

    let resizeObserver = new ResizeObserver(() => this.outputResized());
    resizeObserver.observe(this.mainElement);

    atom.commands.add('de-workbench-terminal-view', {
          'de-workbench-terminal:copy': () => this.copyToClipboard()
    });

    this.terminal = new Terminal({
        scrollback:500,
        useStyle: false,
        cursorBlink: false
      });
    this.terminal.open(this.mainElement)
    this.terminal.fit();

  }

  copyToClipboard(){
    console.log("copy!!!!!!!!");
    return atom.clipboard.write(this.terminal.getSelection());
  }
  
  protected outputResized(){
    return this.terminal.fit();
  }

  isAutoscroll():boolean{
    return this.autoscroll;
  }

  setAutoscroll(value:boolean){
    this.autoscroll=value;
  }

  private appendNewNode(newLine:LogLine){
    /*let cssClass= this.getClassByLevel(newLine.logLevel);
    let element:HTMLElement = this.createLogLineElement(newLine,cssClass);
    this.element().appendChild(element);
    this.updateScroll();*/
    this.terminal.writeln(`${newLine.timestamp} - ${newLine.message}`);
  }

  updateScroll(force?:boolean){
    if (this.autoscroll || force){
      //this.mainElement.scrollTop = this.mainElement.scrollHeight;
      this.terminal.scrollToBottom();
    }
  }

  getClassByLevel(level:LogLevel):string{
    switch(level){
      case LogLevel.TRACE:
        return "trace";
      case LogLevel.DEBUG:
        return "debug";
      case LogLevel.INFO:
        return "info";
      case LogLevel.WARN:
        return "warn";
      case LogLevel.ERROR:
        return "error";
    }
    return "debug";
  }

  rowAppended(newLine:LogLine){
    this.appendNewNode(newLine);
  }

  rowDropped(line:LogLine){
    //this.mainElement.removeChild(this.mainElement.firstChild);
  }

  rowsChanged(){
    console.log("rowsChanged","repeat rendering");
    this.render();
  }

  private render(){
    this.clearMainElement();
    const count=this.model.getRowCount();
    for(let i=0;i< count;i++){
      this.appendNewNode(this.model.getRowAt(i));
    }
  }

  private clearMainElement(){
    /*if(!this.mainElement){
      return;
    }
    while(this.mainElement.firstChild){
      this.mainElement.removeChild(this.mainElement.firstChild);
    }*/
    this.terminal.clear();
  }

  private createLogLineElement(logLine:LogLine, className?:string):HTMLElement {
    let message = logLine.timestamp + ' - ' + logLine.message;
    return createElement('div',{
      elements: [
        createElement('div',{
          elements : [
            createText(message)
          ],
          className: "de-workbench-uilogger-logline-message"
        })
      ],
      className: "de-workbench-uilogger-logline " + (className?className:'')
    })
  }
}



export class UILoggerComponent extends UIBaseComponent {
  public readonly autoscroll:boolean = true;
  private toolbar:UILoggerToolbarComponent;
  private logView:UILogView;
  private logModel:FilterableLogModel;

  constructor(showToolbar?:boolean,logModel?:LogModel){
      super();
      this.logModel = new FilterableLogModel(logModel || new BaseLogModel());
      this.logView= new UILogView(this.logModel);
      this.buildUI(showToolbar || false);
  }

  public getFilterableModel():FilterableLogModel {
    return this.logModel;
  }

  private buildUI(showToolbar){
    if(showToolbar){
      this.toolbar = new UILoggerToolbarComponent();
      this.toolbar.setTarget(this.logModel);
      this.toolbar.setActionDelegate((action:LoggerToolbarAction) => {
        switch(action){
          case "toggleAutoscroll":
            this.setAutoscroll(!this.autoscroll);
          break;
          case "clearLog":
            this.logModel.clear();
          break;
        }
      })
      this.mainElement = createElement('div',{
        elements: [
          this.toolbar.element(),
          this.logView.element()
        ],
        className: "de-workbench-uilogger-container"
      })
    }else{
      this.mainElement = createElement('div',{
        elements: [
          this.logView.element()
        ],
        className: "de-workbench-uilogger-container"
      })
    }

  }


  public addLog(message:string, level?:LogLevel, timestamp?:string):UILoggerComponent{
    //let completeMessage =  UILoggerComponent.getFormattedTimestamp() + " - " + message;
    this.logModel.appendLogLine({
      message: message,
      logLevel:level || LogLevel.DEBUG,
      timestamp:timestamp || UILoggerComponent.getFormattedTimestamp()
    });
    return this;
  }

  private static getFormattedTimestamp():string{
    return moment().format('MM-DD hh:mm:ss.SSS');
  }

  public updateScroll():UILoggerComponent{
    /*if (this.autoscroll){
      this.mainElement.scrollTop = this.mainElement.scrollHeight;
    }
    return this;*/
    this.logView.updateScroll(true);
    return this;
  }

  public setAutoscroll(autoscroll:boolean):UILoggerComponent{
    this.logView.setAutoscroll(autoscroll);
    return this;
  }

}

//<input class='input-search' type='search' placeholder='Search'>

class TextFilter implements Filter<LogLine>{
  private value:string = null;
  private regexp:RegExp =null;
  setText(value:string){
    this.value=value;
    if(value){
      this.regexp=new RegExp(_.escapeRegExp(value));
    }else{
      this.regexp = null;
    }
  }
  evaluateFilter(log:LogLine):boolean{
    if(this.value == null || this.regexp == null){
      return true;
    }
    return this.regexp.test(log.message || "");
  }
}

class LogLevelFilter implements Filter<LogLine> {
  private level:LogLevel;
  constructor(initialValue?:LogLevel){
    this.level=initialValue || LogLevel.TRACE;
  }
  getLogLevel():LogLevel {
    return this.level;
  }
  setLogLevel(level:number){
    this.level=level;
  }
  evaluateFilter(log:LogLine):boolean{
    return log.logLevel > this.level;
  }
}

type ActionDelegate=(type:LoggerToolbarAction) => void
type LoggerToolbarAction ="toggleAutoscroll"|"clearLog";

class UILoggerToolbarComponent extends UIToolbar implements UISelectListener {
    private target:IFilterableModel = null;
    private regexpfilter:TextFilter = new TextFilter();
    private levelFilter:LogLevelFilter = new LogLevelFilter();
    private actionDelegate:ActionDelegate = null;
    constructor(){
      super();
      this.setupToolbar();
    }

    setTarget(target:IFilterableModel){
      this.target = target;
      this.target.addFilter(this.regexpfilter);
      this.target.addFilter(this.levelFilter);
    }

    setActionDelegate(delegate:ActionDelegate){
      this.actionDelegate = delegate;
    }

    private setupToolbar(){
      this.createAndAddSearchFilter(this)
      let subToolbar=this.createButtonToolbar();
      this.addElementNoSpace(subToolbar.element());
    }
    createAndAddSearchFilter(container:UIToolbar){
      let searchTextField = createTextEditor({
        type:'search',
        placeholder: 'Filter log',
        change: (value) => {
          console.log("Value changed: ", value);
          this.regexpfilter.setText(value);
          setTimeout(() => {
            this.target.evaluateAllFilters();
          });
        }
      })
      searchTextField.classList.add("de-workbench-uilogger-search-field")
      searchTextField.classList.add("inline-block")
      container.addElementNoSpace(searchTextField);
    }

    createAndAddLogLevelSelect(container:UIToolbar){
      let opts= this.createLoggerFilterOptions();
      let levelSelect= new UISelect(opts);
      levelSelect.addSelectListener(this);
      container.addElementNoSpace(levelSelect.element());
    }

    createButtonToolbar():UIToolbar{
      let buttonToolbar:UIToolbar=new UIToolbar();
      this.createAndAddLogLevelSelect(buttonToolbar);
      let autoScrollButton:UIToolbarButton = new UIToolbarButton();
      autoScrollButton.setId("autoScroll");
      autoScrollButton.setWithSpace(false);
      autoScrollButton.setIcon(" icon-move-down");
      autoScrollButton.handler=() => {
        if(this.actionDelegate){
          this.actionDelegate("toggleAutoscroll");
        }
      };
      buttonToolbar.addButton(autoScrollButton);
      let clearLog:UIToolbarButton = new UIToolbarButton();
      clearLog.setId("clearLog");
      clearLog.setIcon(" icon-trashcan");
      clearLog.setWithSpace(false);
      clearLog.handler=() => {
        if(this.actionDelegate){
          this.actionDelegate("clearLog");
        }
      };
      buttonToolbar.addButton(clearLog);
      return buttonToolbar;
    }

    onItemSelected(value:string){
      this.levelFilter.setLogLevel(parseInt(value));
      setTimeout(() => {
        this.target.evaluateAllFilters();
      });
    }

    private createLoggerFilterOptions():Array<UISelectItem>{
      return [
        {name:'verbose',value:LogLevel.TRACE.toString()},
        {name:'debug',value:LogLevel.DEBUG.toString()},
        {name:'info',value:LogLevel.INFO.toString()},
        {name:'warn',value:LogLevel.WARN.toString()},
        {name:'error',value:LogLevel.ERROR.toString()},
      ];
    }

}
