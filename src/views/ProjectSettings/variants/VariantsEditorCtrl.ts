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
import { UIModalPrompt } from '../../../ui-components/UIModalPrompt'

export class VariantsEditorCtrl extends UIBaseComponent {

    private projectRoot:string;
    private tabbedView: UITabbedView;
    private events:EventEmitter;
    private variantsManager:VariantsManager;
    private variantsModel:VariantsModel;
    private modalPrompt:UIModalPrompt;

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
      let cloneVariantButton = createElement('button',{
        className: 'btn btn-xs icon icon-clippy'
      })
      atom["tooltips"].add(cloneVariantButton, {title:'Clone selected Variant'})
      cloneVariantButton.addEventListener('click',()=>{
        this.promtpForCloneVariant()
      })
      let tabbedToolbar = createElement('div',{
        elements: [
          createElement('div', {
            elements: [addVariantButton, removeVariantButton, renameVariantButton, cloneVariantButton],
            className: 'btn-group'
          })
        ], className: 'btn-toolbar'
      });
      tabbedToolbar.style.float = "right"
      // end tabbed toolbar

      this.tabbedView = new UITabbedView()
              .setBottomToolbar(tabbedToolbar);

      this.mainElement = this.tabbedView.element()

      this.modalPrompt = new UIModalPrompt()

      this.reload();
    }

    public reload(){
      this.variantsManager.load().then((results)=>{
        this.variantsModel = results;
        this.updateUI()
      },(error)=>{
        Logger.consoleLog("Failure:", error)
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
      this.modalPrompt.show('', 'New variant name', (variantName)=>{
        this.addNewVariant(variantName)
      },()=>{
        //cencelled by user
      });
    }

    public promtpForRenameVariant(){
      let selectedTab = this.tabbedView.getSelectedTab();
      if (selectedTab){
        this.modalPrompt.show(selectedTab.getTitle(), "Rename '"+selectedTab.getTitle()+"' variant", (newVariantName)=>{
          this.renameVariant(selectedTab.getTitle(), newVariantName)
          selectedTab.setTitle(newVariantName);
        },()=>{
          //cencelled by user
        });
      }
    }

    public promtpForCloneVariant(){
      let selectedTab = this.tabbedView.getSelectedTab();
      if (selectedTab){
        this.modalPrompt.show(selectedTab.getTitle(), "New clone name for '"+selectedTab.getTitle()+"' variant", (newVariantName)=>{
          this.cloneVariant(selectedTab.getTitle(), newVariantName)
        },()=>{
          //cencelled by user
        });
      }
    }

    public promtpForRemoveVariant(){
      let selectedTab = this.tabbedView.getSelectedTab();
      if (selectedTab){
      }

      const selected = atom.confirm({
          message: 'Delete Variant',
          detailedMessage: 'Do you want to confirm the ' + selectedTab.getTitle() +' variant deletion ?',
          buttons: ['Yes, Delete it', 'Cancel']
        });
        if ((selected as any)==0){
          this.removeVariant(selectedTab.getTitle());
        }
    }

    public cloneVariant(variantToCloneName:string,newVariantName:string){
      let variantToClone:Variant = this.variantsModel.getVariant(variantToCloneName);
      let newCloneVariant = this.variantsModel.addVariant(newVariantName);
      newCloneVariant.cloneFrom(variantToClone);
      let newVariantView = this.createVariantView(newCloneVariant);
      this.tabbedView.addView(newVariantView)
      this.saveVariantsChanges()
    }

    public renameVariant(variantName:string,newVariantName:string){
      this.variantsModel.getVariant(variantName).name = newVariantName;
      this.saveVariantsChanges()
    }

    public addNewVariant(variantName:string){
      let newVariant = this.variantsModel.addVariant(variantName);
      let newVariantView = this.createVariantView(newVariant);
      this.tabbedView.addView(newVariantView)
      this.saveVariantsChanges()
    }

    public removeVariant(variantName:string){
      this.variantsModel.removeVariant(variantName);
      this.tabbedView.removeViewByTitle(variantName)
      this.saveVariantsChanges()
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
