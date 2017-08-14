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
import { UIExtendedListView, UIExtendedListViewModel, UIExtendedListViewValidationResult } from '../../../ui-components/UIExtendedListView'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UITreeViewModel, UITreeViewSelectListener, UITreeView, UITreeItem } from '../../../ui-components/UITreeView'
import { UIButtonGroupMode, UIButtonConfig, UIButtonGroup } from '../../../ui-components/UIButtonGroup'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView'
import { VariantsGridCtrl } from './VariantsGridCtrl'
import { VariantsManager, VariantsModel, Variant, VariantPlatform, VariantPreference } from '../../../DEWorkbench/VariantsManager'

export class VariantsEditorCtrl extends UIBaseComponent {

    private projectRoot:string;
    private tabbedView: UITabbedView;
    private events:EventEmitter;
    private variantsManager:VariantsManager;
    private variantsModel:VariantsModel;

    constructor(projectRoot:string){
      super()
      this.events = new EventEmitter()
      this.projectRoot = projectRoot;
      this.variantsManager = new VariantsManager(this.projectRoot)
      this.initUI();
    }

    protected initUI(){

      // tabbed toolbar
      let addVariantButton = createElement('button',{
        //elements : [ createText("New...")],
        className: 'btn btn-xs icon icon-gist-new'
      })
      atom["tooltips"].add(addVariantButton, {title:'Create a new Variant'})
      addVariantButton.addEventListener('click', (evt)=>{
        this.promtpForNewVariant()
      })
      let removeVariantButton = createElement('button',{
        //elements : [ createText("Delete")],
        className: 'btn btn-xs icon icon-dash'
      })
      atom["tooltips"].add(removeVariantButton, {title:'Remove selected Variant'})
      removeVariantButton.addEventListener('click',()=>{
        this.promtpForRemoveVariant()
      })
      let renameVariantButton = createElement('button',{
        //elements : [ createText("Rename")],
        className: 'btn btn-xs icon icon-pencil'
      })
      atom["tooltips"].add(renameVariantButton, {title:'Rename selected Variant'})
      renameVariantButton.addEventListener('click',()=>{
        this.promtpForRenameVariant()
      })
      let duplicateVariantButton = createElement('button',{
        className: 'btn btn-xs icon icon-clippy'
      })
      atom["tooltips"].add(duplicateVariantButton, {title:'Duplicate selected Variant'})
      duplicateVariantButton.addEventListener('click',()=>{
        this.promtpForDuplicateVariant()
      })
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

      this.tabbedView = new UITabbedView()
              .setBottomToolbar(tabbedToolbar);

      this.mainElement = this.tabbedView.element()

      this.reload();
    }

    public reload(){
      this.variantsManager.load().then((results)=>{
        this.variantsModel = results;
        this.updateUI()
      },(error)=>{
        console.log("Failure:", error)
      });
    }

    private updateUI(){
      this.tabbedView.removeAllTabs();
      if (this.variantsModel && this.variantsModel.variants){
        for (var i=0;i<this.variantsModel.variants.length;i++){
          let variant:Variant = this.variantsModel.variants[i]
            let variantView = this.createVariantView(variant)
            this.tabbedView.addView(variantView)
        }
      }
    }

    public addEventListener(event:string,listener:any){
      this.events.addListener(event, listener)
    }

    public removeEventListener(event:string, listener:any){
      this.events.removeListener(event, listener)
    }

    public promtpForNewVariant(){
      //TODO!!
    }

    public promtpForRemoveVariant(){
      //TODO!!
    }

    public promtpForRenameVariant(){
      //TODO!!
    }

    public promtpForDuplicateVariant(){
      //TODO!!
    }

    public addNewVariant(variantName:string){
    }

    protected createVariantView(variant:Variant):UITabbedViewItem {
      let variantsCtrl = new VariantsGridCtrl(variant);
      variantsCtrl.addEventListener('didDataChanged',(variantsGridCtrl)=>{
        this.saveVariantsChanges();
        this.fireDataChanged();
      })
      variantsCtrl.element().style.width = "100%"
      let variantView = new UITabbedViewItem(variant.name, variant.name, variantsCtrl.element())
      return variantView;
    }

    protected saveVariantsChanges(){
      this.variantsManager.store(this.variantsModel);
    }

    protected fireDataChanged(){
      this.events.emit("didDataChanged", this)
    }

    public destroy(){
      this.events.removeAllListeners();
      this.tabbedView.destroy();
      super.destroy();
      this.events = null;
    }

}
