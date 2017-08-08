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
} from '../../element/index';

import { EventEmitter }  from 'events'
import { Logger } from '../../logger/Logger'
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../ui-components/UITabbedView'
import { ProjectManager } from '../../DEWorkbench/ProjectManager'


export class VariantsView  extends UIBaseComponent {

  private stackedPage: UIStackedView;
  private tabbedView: UITabbedView;
  private currentProjectRoot:string;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
    this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();

    // tabbed toolbar
    let addVariantButton = createElement('button',{
      //elements : [ createText("New...")],
      className: 'btn btn-xs icon icon-gist-new'
    })
    let removeVariantButton = createElement('button',{
      //elements : [ createText("Delete")],
      className: 'btn btn-xs icon icon-dash'
    })
    let renameVariantButton = createElement('button',{
      //elements : [ createText("Rename")],
      className: 'btn btn-xs icon icon-pencil'
    })
    let duplicateVariantButton = createElement('button',{
      //elements : [ createText("Duplicate")],
      className: 'btn btn-xs icon icon-clippy'
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


    let mainContainer = createElement('div',{
      elements: [ this.tabbedView.element() ]
    });
    //mainContainer.style.border = "solid 1px"
    mainContainer.style.height = "80%"

    this.stackedPage = new UIStackedView()
                        .setTitle('Build Variants')
                        .setInnerView(mainContainer);
    this.mainElement = this.stackedPage.element();

  }

}
