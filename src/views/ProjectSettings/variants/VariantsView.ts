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
    /**
    // tabbed toolbar
    let addVariantButton = createElement('button',{
      //elements : [ createText("New...")],
      className: 'btn btn-xs icon icon-gist-new'
    })
    atom["tooltips"].add(addVariantButton, {title:'Create a new Variant'})
    let removeVariantButton = createElement('button',{
      //elements : [ createText("Delete")],
      className: 'btn btn-xs icon icon-dash'
    })
    atom["tooltips"].add(removeVariantButton, {title:'Remove selected Variant'})
    let renameVariantButton = createElement('button',{
      //elements : [ createText("Rename")],
      className: 'btn btn-xs icon icon-pencil'
    })
    atom["tooltips"].add(renameVariantButton, {title:'Rename selected Variant'})
    let duplicateVariantButton = createElement('button',{
      className: 'btn btn-xs icon icon-clippy'
    })
    atom["tooltips"].add(duplicateVariantButton, {title:'Duplicate selected Variant'})
    let tabbedToolbar = createElement('div',{
      elements: [
        createElement('div', {
          elements: [addVariantButton, removeVariantButton, renameVariantButton, duplicateVariantButton],
          className: 'btn-group'
        })
      ], className: 'btn-toolbar'
    });
    tabbedToolbar.style.float = "right"
    // end tabbed toolbar

    //let htmlTable:any = this.createFooTable();
    //let listView2 = new UIExtendedListView(new EditableListViewModel())
    let variantsCtrl = new VariantsGridCtrl();

    this.tabbedView = new UITabbedView()
            .setBottomToolbar(tabbedToolbar);


    this.tabbedView.addView(this.createVariantView('Dev'));
    this.tabbedView.addView(this.createVariantView('Dev-Local'));
    this.tabbedView.addView(this.createVariantView('Test'));
    this.tabbedView.addView(this.createVariantView('UAT'));
    this.tabbedView.addView(this.createVariantView('Production'));
    **/

    this.variantsEditorCtrl = new VariantsEditorCtrl(this.currentProjectRoot);

    let mainContainer = createElement('div',{
      elements: [ this.variantsEditorCtrl.element() ]
    });
    mainContainer.style.height = "80%"

    this.stackedPage = new UIStackedView()
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
