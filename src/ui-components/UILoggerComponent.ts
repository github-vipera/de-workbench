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
const moment = require('moment')

export interface LogLine{
  logLevel:LogLevel
  message:string
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


export class UILogView extends UIBaseComponent implements LogModelListener {
  private model:LogModel;
  private autoscroll:boolean = true;
  constructor(model?:LogModel){
    super();
    this.model=model != null? model:new BaseLogModel();
    this.model.addListener(this);
    this.initUI();
  }
  private initUI(){
    this.mainElement = createElement('div',{
      className: "de-workbench-uilogger-loglines"
    });
  }

  isAutoscroll():boolean{
    return this.autoscroll;
  }

  setAutoscroll(value:boolean){
    this.autoscroll=value;
  }

  private appendNewNode(newLine:LogLine){
    let cssClass= this.getClassByLevel(newLine.logLevel);
    let element:HTMLElement = this.createLogLineElement(newLine.message,cssClass);
    this.element().appendChild(element);
    this.updateScroll();
  }

  updateScroll(force?:boolean){
    if (this.autoscroll || force){
      this.mainElement.scrollTop = this.mainElement.scrollHeight;
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
    this.mainElement.removeChild(this.mainElement.firstChild);
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
    if(!this.mainElement){
      return;
    }
    while(this.mainElement.firstChild){
      this.mainElement.removeChild(this.mainElement.firstChild);
    }
  }

  private createLogLineElement(message:string, className?:string):HTMLElement {
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

  constructor(showToolbar?:boolean){
      super();
      this.logModel = new FilterableLogModel(new BaseLogModel());
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


  public addLog(message:string, level?:LogLevel):UILoggerComponent{
    let completeMessage = UILoggerComponent.getFormattedTimestamp() + " - " + message;
    this.logModel.appendLogLine({
      message: completeMessage,
      logLevel:level || LogLevel.DEBUG,
    });
    //this.updateScroll();
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

class UILoggerToolbarComponent extends UIToolbar implements UISelectListener {
    private target:IFilterableModel = null;
    private regexpfilter:TextFilter = new TextFilter();
    private levelFilter:LogLevelFilter = new LogLevelFilter();
    constructor(){
      super();
      this.setupToolbar();
    }

    setTarget(target:IFilterableModel){
      this.target = target;
      this.target.addFilter(this.regexpfilter);
      this.target.addFilter(this.levelFilter);
    }

    private setupToolbar(){

      // Search field
      this.createAndAddSearchFilter(this)
      let subToolbar=this.createButtonToolbar();
      this.createAndAddLogLevelSelect(subToolbar);
      this.addElement(subToolbar.element());
      /*let autoscrollToggle = new UIToolbarButton()
                        .setId('test2')
                        .setToggle(true)
                        .setTitle('Auto scroll')
                        .setChecked(true)
                        .setHandler(()=>{alert('button2')})*/
      //this.addRightButton(autoscrollToggle);

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
      container.addElement(searchTextField);
    }

    createAndAddLogLevelSelect(container:UIToolbar){
      let opts= this.createLoggerFilterOptions();
      let levelSelect= new UISelect(opts);
      levelSelect.addSelectListener(this);
      container.addElement(levelSelect.element());
    }

    createButtonToolbar():UIToolbar{
      let buttonToolbar:UIToolbar=new UIToolbar();
      let autoScrollButton:UIToolbarButton = new UIToolbarButton();
      autoScrollButton.setId("autoScroll");
      autoScrollButton.setIcon("move-down");
      buttonToolbar.addButton(autoScrollButton);
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
