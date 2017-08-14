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

export class VariantsEditorCtrl extends UIBaseComponent {

    private projectRoot:string;
    private eventEmitter:EventEmitter;
    private tabbedView: UITabbedView;

    constructor(projectRoot:string){
      super()
      this.eventEmitter = new EventEmitter()
      this.projectRoot = projectRoot;
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

    }

    public on(event:string,listener:any){
      this.eventEmitter.on(event, listener)
    }

    public off(event:string, listener:any){
      this.eventEmitter.removeListener(event, listener)
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


}
