'use babel'
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
} from '../../element/index';

import { UIExtendedListView, UIExtendedListViewModel, UIExtendedListViewValidationResult } from '../../ui-components/UIExtendedListView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UIButtonGroup, UIButtonGroupMode, UIButtonConfig } from '../../ui-components/UIButtonGroup'
import { CordovaTaskConfiguration } from '../../cordova/CordovaTasks'
import { CordovaProjectInfo } from '../../cordova/Cordova'
import { EventEmitter }  from 'events'

export class TaskViewEnvironmentTab extends UIBaseComponent {
  private environmentVarRenderer: TaskViewEnvironmentRenderer;
  private cliParamsRenderer: TaskViewCliParamsRenderer;
  constructor(){
    super();
    this.initUI();
  }
  initUI(){
    this.environmentVarRenderer = new TaskViewEnvironmentRenderer();
    this.cliParamsRenderer = new TaskViewCliParamsRenderer();
    this.mainElement=createElement('div',{
      className:'task-env-tab-container',
      elements:[
        this.environmentVarRenderer.element(),
        this.cliParamsRenderer.element()
      ]
    });
  }
  contextualize(task:CordovaTaskConfiguration,project: CordovaProjectInfo){
    if(!task.envVariables){
      task.envVariables = [];
    }
    this.environmentVarRenderer.updateUI(task.envVariables);
    if(!task.cliParams){
      task.cliParams = [];
    }
    this.cliParamsRenderer.updateUI(task.cliParams);
  }
}


class TaskViewEnvironmentRenderer extends UIBaseComponent {
  private listView:UIExtendedListView;
  private model:EnvironmentVarListViewModel;
  private toolbar:HTMLElement
  private events:EventEmitter;
  constructor(){
    super();
    this.events = new EventEmitter();
    this.initUI()
  }
  private initUI(){
    this.initToolbar();
    this.initListView();
    this.mainElement = createElement('div', {
      elements: [ this.toolbar, this.listView.element() ],
      className: 'de-workbench-variants-ctrl-prop-renderer'
    })
  }

  private initToolbar(){
    let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
    buttonGroup.addButton(new UIButtonConfig()
                            .setId('add')
                            .setCaption("+")
                            .setClickListener(()=>{
                              this.model.addNewProperty();
                             }))
    buttonGroup.addButton(new UIButtonConfig()
                            .setId('add')
                            .setCaption("-")
                            .setClickListener(()=>{
                                this.removeSelectedRow();
                             }))
    buttonGroup.element().classList.add('btn-group-xs')
    this.toolbar = createElement('div',{
      elements : [
        buttonGroup.element()
      ],
      className: 'de-workbench-variants-ctrl-toolbar'
    })
  }

  private initListView(){
    this.model = this.buildModel([])
      .addEventListener('didModelChanged',()=>{
        this.fireDataChanged();
      });
    this.listView = new UIExtendedListView(this.model);
  }

  protected removeSelectedRow(){
    let row = this.listView.getSelectedRow();
    this.model.removePropertyAt(row)
    this.events.emit("didPropertyRemoved")
  }

  updateUI(values:Array<EnvironmentVariable>){
    console.log('update ui');
    this.model.forceProperties(values);
  }
  private buildModel(values:Array<EnvironmentVariable>):EnvironmentVarListViewModel{
    return new EnvironmentVarListViewModel(values);
  }

  private fireDataChanged(){
    console.log('fireDataChanged');
    this.events.emit('didEnvironmenVarDataChanged');
  }

}

interface EnvironmentVariable {
  name:string
  value:string
}


class EnvironmentVarListViewModel implements UIExtendedListViewModel {

  protected properties:Array<EnvironmentVariable>
  protected events:EventEmitter;

  constructor(properties?:Array<EnvironmentVariable> ){
    this.events = new EventEmitter();
    this.properties = properties != null? properties : [];
  }

  public addEventListener(event:string,listener):EnvironmentVarListViewModel {
      this.events.addListener(event, listener);
      return this;
  }

  public removeEventListener(event:string,listener):EnvironmentVarListViewModel {
      this.events.removeListener(event, listener);
      return this;
  }

  public addNewProperty(){
    this.properties.push({
      name:"New Env var Name",
      value:"New Env var Value"
    });
    this.fireModelChanged();
  }

  public removePropertyAt(index:number){
    if (index>=0){
      this.properties.splice(index, 1);
      this.fireModelChanged();
    }
  }

  hasHeader():boolean{
    return true
  }

  getRowCount():number {
    return this.properties.length
  }

  getColCount():number {
    return 2
  }

  getValueAt(row:number, col:number):any {
    let property:EnvironmentVariable =  this.properties[row];
    if (col===0){
      return property.name;
    } else if (col===1){
      return property.value;
    }
  }

  getClassNameAt(row:number, col:number):string{
    return ""
  }

  getColumnName(col:number):string {
    if (col===0){
      return "Env Variable name"
    } else if (col===1){
      return "Value"
    }
    return col+"?"
  }

  getClassName():string {
    return ""
  }

  isCellEditable(row:number, col:number):boolean {
    return true;
  }

  onValueChanged(row:number, col:number, value:any) {
    let property:EnvironmentVariable =  this.properties[row];
    if (col===0){
      property.name = value;
    } else if (col===1){
      property.value = value;
    }
    this.fireModelChanged();
  }

  onEditValidation(row:number, col:number, value:any):UIExtendedListViewValidationResult {
    return {
      validationStatus:true,
      validationErrorMessage:"",
      showValidationError:false
    };
  }

  protected fireModelChanged(){
    this.events.emit("didModelChanged", this)
  }

  forceProperties(values:Array<EnvironmentVariable>){
    this.properties = values;
    this.fireModelChanged();
  }

  public destroy(){
    this.events.removeAllListeners();
    this.events = null;
  }

}


class TaskViewCliParamsRenderer extends UIBaseComponent {
  private listView:UIExtendedListView;
  private model:CliParamsListViewModel;
  private toolbar:HTMLElement
  private events:EventEmitter;
  constructor(){
    super();
    this.events = new EventEmitter();
    this.initUI();
  }
  private initUI(){
    this.initToolbar();
    this.initListView();
    this.mainElement = createElement('div', {
      elements: [ this.toolbar, this.listView.element() ],
      className: 'de-workbench-variants-ctrl-prop-renderer'
    })
  }
  private initToolbar(){
    let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
    buttonGroup.addButton(new UIButtonConfig()
                            .setId('add')
                            .setCaption("+")
                            .setClickListener(()=>{
                              this.model.addNewProperty();
                             }))
    buttonGroup.addButton(new UIButtonConfig()
                            .setId('add')
                            .setCaption("-")
                            .setClickListener(()=>{
                                this.removeSelectedRow();
                             }))
    buttonGroup.element().classList.add('btn-group-xs')
    this.toolbar = createElement('div',{
      elements : [
        buttonGroup.element()
      ],
      className: 'de-workbench-variants-ctrl-toolbar'
    })
  }

  private initListView(){
    this.model = this.buildModel([])
      .addEventListener('didModelChanged',()=>{
        this.fireDataChanged();
      });
    this.listView = new UIExtendedListView(this.model);
  }

  protected removeSelectedRow(){
    let row = this.listView.getSelectedRow();
    this.model.removePropertyAt(row)
    this.events.emit("didPropertyRemoved")
  }

  updateUI(values:Array<string>){
    console.log('update ui');
    this.model.forceValues(values);
  }
  private buildModel(values:Array<string>):CliParamsListViewModel{
    return new CliParamsListViewModel(values);
  }

  private fireDataChanged(){
    console.log('fireDataChanged');
    this.events.emit('didCliParamsDataChanged');
  }
}

class CliParamsListViewModel implements UIExtendedListViewModel{
  protected values:Array<string>
  protected events:EventEmitter;

  constructor(values?:Array<string> ){
    this.events = new EventEmitter();
    this.values = values != null? values : [];
  }

  public addEventListener(event:string,listener):CliParamsListViewModel {
      this.events.addListener(event, listener);
      return this;
  }

  public removeEventListener(event:string,listener):CliParamsListViewModel {
      this.events.removeListener(event, listener);
      return this;
  }

  public addNewProperty(){
    this.values.push("--NewParams");
    this.fireModelChanged();
  }

  public removePropertyAt(index:number){
    if (index>=0){
      this.values.splice(index, 1);
      this.fireModelChanged();
    }
  }

  hasHeader():boolean{
    return true
  }

  getRowCount():number {
    return this.values.length
  }

  getColCount():number {
    return 1
  }

  getValueAt(row:number, col:number):any {
    let property:string =  this.values[row];
    return property
  }

  getClassNameAt(row:number, col:number):string{
    return ""
  }

  getColumnName(col:number):string {
    if (col===0){
      return "Cli Args"
    }
    return col+"?"
  }

  getClassName():string {
    return ""
  }

  isCellEditable(row:number, col:number):boolean {
    return true;
  }

  onValueChanged(row:number, col:number, value:any) {
    let property:string = this.values[row];
    if (col===0){
      this.values[row] = value;
    }
    this.fireModelChanged();
  }

  onEditValidation(row:number, col:number, value:any):UIExtendedListViewValidationResult {
    let sValue:string = value;
    if(value.indexOf(' ') >= 0){
      return {
        validationStatus:true,
        validationErrorMessage:"Space are not supported",
        showValidationError:true
      };
    }
    return {
      validationStatus:true,
      validationErrorMessage:"",
      showValidationError:false
    };
  }

  protected fireModelChanged(){
    this.events.emit("didModelChanged", this)
  }

  forceValues(values:Array<string>){
    this.values = values;
    this.fireModelChanged();
  }

  public destroy(){
    this.events.removeAllListeners();
    this.events = null;
  }

}
