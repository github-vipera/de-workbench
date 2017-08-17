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

import { EventEmitter }  from 'events'
import { Logger } from '../../../logger/Logger'
import { UIStackedView } from '../../../ui-components/UIStackedView'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView'
import { ProjectManager } from '../../../DEWorkbench/ProjectManager'
import { UIListView, UIListViewModel } from '../../../ui-components/UIListView'
import { UIExtendedListView, UIExtendedListViewModel, UIExtendedListViewValidationResult } from '../../../ui-components/UIExtendedListView'
import { VariantsGridCtrl } from './VariantsGridCtrl'
import { VariantsEditorCtrl } from './VariantsEditorCtrl'

export class VariantsView  extends UIBaseComponent {

  private stackedPage: UIStackedView;
  //private tabbedView: UITabbedView;
  private currentProjectRoot:string;

  private variantsEditorCtrl:VariantsEditorCtrl;

  //private listView:UIListView;
  //private listViewModel:UIListViewModel;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
    this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();

    this.variantsEditorCtrl = new VariantsEditorCtrl(this.currentProjectRoot);

    let mainContainer = createElement('div',{
      elements: [ this.variantsEditorCtrl.element() ]
    });
    mainContainer.style.height = "80%"

    this.stackedPage = new UIStackedView({
                          titleIconClass: 'icon-versions'
                        })
                        .setTitle('Build Variants')
                        .setInnerView(mainContainer);
    this.mainElement = this.stackedPage.element();

  }

  /**
  private createVariantView(variantName:string):UITabbedViewItem {
    let variantsCtrl = new VariantsGridCtrl();
    variantsCtrl.element().style.width = "100%"
    let variantView = new UITabbedViewItem(variantName, variantName, variantsCtrl.element())
    return variantView;
  }
  **/


}

/**
class EditableListViewModel implements UIExtendedListViewModel {

  constructor(){}

  hasHeader():boolean{
    return true
  }

  getRowCount():number {
    return 3
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
    if (col==1){
      return true;
    } else {
      return false;
    }
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
**/
