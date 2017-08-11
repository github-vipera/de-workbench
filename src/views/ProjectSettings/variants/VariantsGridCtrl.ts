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
import { UITreeViewModel, UITreeViewSelectListener, UITreeView, UITreeItem } from '../../../ui-components/UITreeView'
import { UIButtonGroupMode, UIButtonConfig, UIButtonGroup } from '../../../ui-components/UIButtonGroup'

export class VariantsGridCtrl extends UIBaseComponent {

  protected treeModel:VariantsTreeModel;
  protected treeView:UITreeView;

  constructor(){
    super();
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

    return new VariantsTreeModel().setRoot(rootNode);
  }

}

export class VariantsTreeModel implements UITreeViewModel {

  root:VariantsTreeItem;

  className?:string;

  constructor(){
  }

  public setRoot(root:VariantsTreeItem):VariantsTreeModel {
    this.root = root;
    return this;
  }

  getItemById?(id:string,model:UITreeViewModel):VariantsTreeItem {
      return null;
  } // optional, if provided, listeners receive both id and item of selection

}

export class VariantsTreeItem implements UITreeItem {

  public id:string;
  public name:string;
  public children:Array<VariantsTreeItem>;
  public htmlElement:HTMLElement=undefined;

  constructor(id:string, name:string){
    this.id = id;
    this.name = name;
  }

  public setChildren(children:Array<VariantsTreeItem>):VariantsTreeItem {
    this.children = children;
    return this;
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
    let propertyListChild = new VariantsTreeItem(this.id + "_properties",this.id + "_properties");
    propertyListChild.htmlElement = this.propertyRenderer.element()
    this.children = [propertyListChild]
  }

}

class VariantsPropertyRenderer extends UIBaseComponent {

  protected listView:UIExtendedListView;
  protected model:VariantsPlatformListViewModel;
  protected toolbar:HTMLElement;

  constructor(){
    super();
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
    this.model = new VariantsPlatformListViewModel(()=>{
      this.listView.modelChanged();
    });
    this.listView = new UIExtendedListView(this.model)
    this.mainElement = createElement('div', {
      elements: [ this.toolbar, this.listView.element() ],
      className: 'de-workbench-variants-ctrl-prop-renderer'
    })
  }

  protected addNewRow(){
    this.model.addNewProperty();
    this.listView.modelChanged();
  }

  protected removeSelectedRow(){
    let row = this.listView.getSelectedRow();
    this.model.removePropertyAt(row)
    this.listView.modelChanged();
  }
}

class VariantsPlatformListViewModel implements UIExtendedListViewModel {

  protected properties:Array<VariantProperty>
  protected modelListener:Function;

  constructor(modelListener:Function){
    this.properties = [];
    this.modelListener = modelListener;
  }

  public addNewProperty(){
    this.properties.push(new VariantProperty())
  }

  public removePropertyAt(index:number){
    if (index>=0){
      this.properties.splice(index, 1);
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
    this.modelListener()
  }

}

export class VariantProperty {
  public name:string="New Property Name";
  public value:any="The Property Value";
}
