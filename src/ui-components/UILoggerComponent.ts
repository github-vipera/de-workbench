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
  private _filters:Array<Filter<LogLine>>
  constructor(model:LogModel){
    super();
    this.model=model;
    this.model.addListener(this);
  }
  appendLogLine(logLine:LogLine):void {
    this.model.appendLogLine(logLine);
  }

  getRowCount():number{
    return this.model.getRowCount();
  }

  getRowAt(index:number){
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
    _.forEach(this._listeners,function(single){
      single.rowAppended(logLine);
    });
  }

  rowsChanged(){
    _.forEach(this._listeners,function(single){
      single.rowsChanged();
    });
  }

  addFilter(filter: Filter<LogLine>){
    this._filters.push(filter)
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
    //TODO
  }
}


export class UILogView extends UIBaseComponent implements LogModelListener {
  private model:LogModel;
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
  createLogLineModel(logLevel:LogLevel,message:string):LogLine{
    return {
      logLevel:logLevel,
      message:message
    }
  }

  rowAppended(newLine:LogLine){
    let cssClass= this.getClassByLevel(newLine.logLevel);
    let element:HTMLElement = this.createLogLineElement(newLine.message,cssClass);
    this.element().appendChild(element);
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
  private logModel:LogModel;

  constructor(){
      super();
      this.logModel = new FilterableLogModel(new BaseLogModel());
      this.logView= new UILogView(this.logModel);
      this.buildUI();
  }

  private buildUI(){
    this.toolbar = new UILoggerToolbarComponent();
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
    this.updateScroll();
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

  public applyFilter(filter:string){
    //TODO!!
  }

  public search(search:string){
    //TODO!!
  }

}

//<input class='input-search' type='search' placeholder='Search'>

class UILoggerToolbarComponent extends UIToolbar {

    constructor(){
      super();
      this.setupToolbar();
    }

    private setupToolbar(){

      // Search field
      let searchTextField = createTextEditor({
        type:'search',
        placeholder: 'Filter log',
        change: (value) => {
          console.log("Value changed: ", value)
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
