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
} from '../../../element/index';

import { UIExtendedListView, UIExtendedListViewModel, UIExtendedListViewValidationResult } from '../../../ui-components/UIExtendedListView'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UITreeViewModel, UITreeViewSelectListener, UITreeView, UITreeItem, findItemInTreeModel } from '../../../ui-components/UITreeView'
import { UIButtonGroupMode, UIButtonConfig, UIButtonGroup } from '../../../ui-components/UIButtonGroup'
import { EventEmitter }  from 'events'

export class VariantsGridCtrl extends UIBaseComponent {

  protected treeModel:VariantsTreeModel;
  protected treeView:UITreeView;
  protected events:EventEmitter;

  constructor(){
    super();
    this.events = new EventEmitter()
    this.initUI();
  }

  protected initUI(){
    this.treeModel = this.createTreeModel();
    this.treeView = new UITreeView(this.treeModel)
    this.mainElement = this.treeView.element()
  }

  protected createTreeModel():VariantsTreeModel {

    let globalPropertiesNode = new VariantsPlatformTreeItem('global', 'Global Properties', [])
    let androidPropertiesNode = new VariantsPlatformTreeItem('android', 'Android Properties', [])
    let iosPropertiesNode = new VariantsPlatformTreeItem('ios', 'iOS Properties', [])
    let browserPropertiesNode = new VariantsPlatformTreeItem('browser', 'Browser Properties',[])

    let rootNode = new VariantsTreeItem('_root', 'Configuration Properties')
                        .setChildren([globalPropertiesNode,androidPropertiesNode,iosPropertiesNode,browserPropertiesNode])

    let newModel:VariantsTreeModel = new VariantsTreeModel().setRoot(rootNode);
    return newModel;
  }

  public destroy(){
    super.destroy();
    this.events.removeAllListeners();
    this.treeView.destroy();
    this.treeModel.destroy();
    this.treeView = null;
    this.treeModel = null;
    this.events = null;
  }

}

export class VariantsTreeModel implements UITreeViewModel {

  root:VariantsTreeItem;
  events:EventEmitter;
  className?:string;

  constructor(){
  }

  public setRoot(root:VariantsTreeItem):VariantsTreeModel {
    this.root = root;
    this.subscribeForItemEvents(root);
    this.events = new EventEmitter();
    return this;
  }

  protected subscribeForItemEvents(treeItem:VariantsTreeItem){
    treeItem.addEventListener('didItemChanged',()=>{
      this.fireModelChanged();
    })
    if (treeItem.children){
      for (var i=0;i<treeItem.children.length;i++){
          this.subscribeForItemEvents(treeItem.children[i])
      }
    }
  }

  getItemById(id:string):VariantsTreeItem {
    return findItemInTreeModel(id, this)
  } // optional, if provided, listeners receive both id and item of selection

  addEventListener(event:string, listener){
    this.events.addListener(event, listener)
  }

  removeEventListener(event:string, listener){
    this.events.removeListener(event, listener)
  }

  protected fireModelChanged(){
    this.events.emit("didModelChanged")
  }

  destroy(){
    this.events.removeAllListeners();
    this.root.destroy();
    this.root = null;
    this.events = null;
  }

}

export class VariantsTreeItem implements UITreeItem {

  public id:string;
  public name:string;
  public children:Array<VariantsTreeItem>;
  public htmlElement:HTMLElement=undefined;
  public expanded:boolean=true;
  protected events:EventEmitter;

  constructor(id:string, name:string){
    this.id = id;
    this.name = name;
    this.events = new EventEmitter();
  }

  public setChildren(children:Array<VariantsTreeItem>):VariantsTreeItem {
    this.children = children;
    return this;
  }

  protected fireItemChanged(){
    this.events.emit("didItemChanged")
  }

  public addEventListener(event:string, listener){
    this.events.addListener(event, listener)
  }

  public removeEventListener(event:string, listener){
    this.events.removeListener(event, listener)
  }

  public destroy(){
    for (var i=0;i<this.children.length;i++){
      this.children[i].destroy();
    }
    this.children = undefined;
  }


}

export class VariantsPlatformTreeItem extends VariantsTreeItem {

  protected properties: Array<any>;
  private propertyRenderer:VariantsPropertyRenderer;

  constructor(platformName:string, displayName:string, properties:Array<any>){
    super(platformName,displayName);
    this.properties = properties;
    this.createChildrenForProperties()
  }

  protected createChildrenForProperties(){
    this.propertyRenderer = new VariantsPropertyRenderer();
    this.propertyRenderer.addEventListener('didDataChanged',()=>{
      this.fireItemChanged()
    })
    let propertyListChild = new VariantsTreeItem(this.id + "_properties",this.id + "_properties");
    propertyListChild.htmlElement = this.propertyRenderer.element()
    this.children = [propertyListChild]
  }


  public destroy(){
    this.events.removeAllListeners()
    this.propertyRenderer.destroy();
    this.properties = null;
    this.events = null;
    super.destroy();
  }


}

class VariantsPropertyRenderer extends UIBaseComponent {

  protected listView:UIExtendedListView;
  protected model:VariantsPlatformListViewModel;
  protected toolbar:HTMLElement;
  protected events:EventEmitter;

  constructor(){
    super();
    this.events = new EventEmitter();
    this.initUI();
  }

  protected initUI() {
    let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
    buttonGroup.addButton(new UIButtonConfig()
                            .setId('add')
                            .setCaption("+")
                            .setClickListener(()=>{
                                this.addNewRow()
                             }))
    buttonGroup.addButton(new UIButtonConfig()
                            .setId('add')
                            .setCaption("-")
                            .setClickListener(()=>{
                                this.removeSelectedRow()
                             }))
    buttonGroup.element().classList.add('btn-group-xs')
    this.toolbar = createElement('div',{
      elements : [
        buttonGroup.element()
      ],
      className: 'de-workbench-variants-ctrl-toolbar'
    })
    this.model = new VariantsPlatformListViewModel()
      .addEventListener('didModelChanged',()=>{
        this.fireDataChanged();
      });
    this.listView = new UIExtendedListView(this.model)
    this.mainElement = createElement('div', {
      elements: [ this.toolbar, this.listView.element() ],
      className: 'de-workbench-variants-ctrl-prop-renderer'
    })
  }

  public addEventListener(event:string, listener){
    this.events.addListener(event, listener)
  }

  public removeEventListener(event:string, listener){
    this.events.removeListener(event, listener)
  }

  protected addNewRow(){
    this.model.addNewProperty();
    this.events.emit("didPropertyAdded")
  }

  protected removeSelectedRow(){
    let row = this.listView.getSelectedRow();
    this.model.removePropertyAt(row)
    this.events.emit("didPropertyRemoved")
  }

  protected fireDataChanged(){
    this.events.emit("didDataChanged")
  }

  public destroy(){
    this.events.removeAllListeners();
    this.listView.destroy();
    this.toolbar.remove();
    this.toolbar = null;
    this.model.destroy();
    this.model = null;
    super.destroy();
  }

}

class VariantsPlatformListViewModel implements UIExtendedListViewModel {

  protected properties:Array<VariantProperty>
  protected events:EventEmitter;

  constructor(){
    this.properties = [];
    this.events = new EventEmitter();
  }

  public addEventListener(event:string,listener):VariantsPlatformListViewModel {
      this.events.addListener(event, listener);
      return this;
  }

  public removeEventListener(event:string,listener):VariantsPlatformListViewModel {
      this.events.removeListener(event, listener);
      return this;
  }

  public addNewProperty(){
    this.properties.push(new VariantProperty())
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
    let property:VariantProperty =  this.properties[row];
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
      return "Property"
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
    let property:VariantProperty =  this.properties[row];
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

  public destroy(){
    this.events.removeAllListeners();
    this.events = null;
  }

}

export class VariantProperty {
  public name:string="New Property Name";
  public value:any="The Property Value";
}
