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
  protected model:EditableListViewModel;
  protected toolbar:HTMLElement;

  constructor(){
    super();
    this.initUI();
  }

  protected initUI() {
    let buttonGroup = new UIButtonGroup(UIButtonGroupMode.Standard);
    buttonGroup.addButton(new UIButtonConfig().setId('add').setCaption("+"))
    buttonGroup.addButton(new UIButtonConfig().setId('add').setCaption("-"))
    buttonGroup.element().classList.add('btn-group-xs')
    this.toolbar = createElement('div',{
      elements : [
        buttonGroup.element()
      ],
      className: 'de-workbench-variants-ctrl-toolbar'
    })
    //this.toolbar.style.floating = "right"
    this.model = new EditableListViewModel();
    this.listView = new UIExtendedListView(this.model)
    this.mainElement = createElement('div', {
      elements: [ this.toolbar, this.listView.element() ]
    })
  }


}

class EditableListViewModel implements UIExtendedListViewModel {

  constructor(){}

  hasHeader():boolean{
    return true
  }

  getRowCount():number {
    return 7
  }

  getColCount():number {
    return 2
  }

  getValueAt(row:number, col:number):any {
    return "" + row +" " + col
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

  }

  onEditValidation(row:number, col:number, value:any):UIExtendedListViewValidationResult {
    return {
      validationStatus:false,
      validationErrorMessage:"Only numbers are allowed",
      showValidationError:true
    };
  }

}

/**
export interface UITreeItem {
  id:string;
  name:string;
  className?:string;
  icon?:string;
  expanded?:boolean;
  htmlElement?:HTMLElement;
  children?:Array<UITreeItem>;
  selected?:boolean;
}
**/
