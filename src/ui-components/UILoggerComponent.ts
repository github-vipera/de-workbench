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
const moment = require('moment')

export enum LogLevel {
  'TRACE',
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
}
export interface LogLine{
  logLevel:LogLevel
  message:string
}
export interface LogModelListener{
  rowAppended(newLine:LogLine):void
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
  public constructor (){

  }
  appendLogLine(logLine:LogLine):void {
    this.logLines.push(logLine);
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

  rowAppended(newLine:LogLine){
    this.appendNewNode(newLine);
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

  updateScroll(){
    if (this.autoscroll){
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
    let completeMessage = UILogView.getFormattedTimestamp() + " - " + message;
    return createElement('div',{
      elements: [
        createElement('div',{
          elements : [
            createText(completeMessage)
          ],
          className: "de-workbench-uilogger-logline-message"
        })
      ],
      className: "de-workbench-uilogger-logline " + (className?className:'')
    })
  }

  private static getFormattedTimestamp():string{
    return moment().format('MM-DD hh:mm:ss.SSS');
  }
}

export class UILoggerComponent extends UIBaseComponent {

  public readonly autoscroll:boolean = true;
  private toolbar:UILoggerToolbarComponent;
  //private loglines:HTMLElement;
  private logView:UILogView;
  private logModel:FilterableLogModel;

  constructor(model?:LogModel){
      super();
      this.logModel = new FilterableLogModel(model || new BaseLogModel());
      this.logView= new UILogView(this.logModel);
      this.buildUI();
  }

  public getFilterableModel():FilterableLogModel {
    return this.logModel;
  }

  private buildUI(){
    this.toolbar = new UILoggerToolbarComponent();
    this.toolbar.setTarget(this.logModel);
    this.mainElement = createElement('div',{
      elements: [
        this.toolbar.element(),
        this.logView.element()
      ],
      className: "de-workbench-uilogger-container"
    })
  }


  public addLog(message:string, level?:LogLevel):UILoggerComponent{
    this.logModel.appendLogLine({
      message: message,
      logLevel:level || LogLevel.DEBUG,
    });
    //this.updateScroll();
    return this;
  }

  public updateScroll():UILoggerComponent{
    if (this.autoscroll){
      this.mainElement.scrollTop = this.mainElement.scrollHeight;
    }
    return this;
  }

  public setAutoscroll(autoscroll:boolean):UILoggerComponent{
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
      this.regexp=new RegExp(value);
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

class UILoggerToolbarComponent extends UIToolbar {
    private target:IFilterableModel = null;
    private filter:TextFilter = new TextFilter();
    private
    constructor(){
      super();
      this.setupToolbar();
    }

    setTarget(target:IFilterableModel){
      this.target = target;
      this.target.addFilter(this.filter);
    }

    private setupToolbar(){

      // Search field
      let searchTextField = createTextEditor({
        type:'search',
        placeholder: 'Filter log',
        change: (value) => {
          console.log("Value changed: ", value);
          this.filter.setText(value);
          this.target.evaluateAllFilters();
        }
      })
      searchTextField.classList.add("de-workbench-uilogger-search-field")
      searchTextField.classList.add("inline-block")
      /**
      let searchTextField = createElement('input',{
        className: 'input-search inline-block de-workbench-uilogger-search-field'
      })
      searchTextField.placeholder = 'Search into the log';
      searchTextField.type = 'Search into the log';
      **/
      this.addElement(searchTextField);

      let testButton = new UIToolbarButton()
                        .setId('find')
                        .setCaption('Find')
                        .setTitle('Search into log')
                        .setWithSpace(false)
                        .setClassName('de-workbench-uilogger-search-button')
                        .setHandler(()=>{alert('button1')})
      this.addButton(testButton);

      // Autoscroll toggle option
      let autoscrollToggle = new UIToolbarButton()
                        .setId('test2')
                        .setToggle(true)
                        .setTitle('Auto scroll')
                        .setChecked(true)
                        .setHandler(()=>{alert('button2')})
      this.addRightButton(autoscrollToggle);



    }

}
