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
import { ProjectManager } from '../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../cordova/Cordova'
import { Logger } from '../../logger/Logger'
import { UIPluginsList } from '../../ui-components/UIPluginsList'
import { UIStackedView } from '../../ui-components/UIStackedView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UITreeView, UITreeViewModel, UITreeItem } from '../../ui-components/UITreeView'

export class VariantsView  extends UIBaseComponent {

  private stackedPage: UIStackedView;
  private treeModel:UITreeViewModel;
  private treeView:UITreeView;

  constructor(){
    super();
    this.buildUI();
  }

  private buildUI(){
    this.stackedPage = new UIStackedView()
                        .setTitle('Build Variants');

    this.mainElement = this.stackedPage.element();

    /**
    let root:UITreeItem = {
      id : 'root',
      name: 'root',
      expanded : true,
      icon: 'icon-file-directory',
      children: [
          { id: 'test', name: 'test', icon: 'test-ts-icon'},
          { id: 'test2', name: 'test 2', icon: 'icon-file-directory',
            children: [
              { id: 'test6', name: 'test 6'},
              { id: 'test7', name: 'test 7'}
            ]
          },
          { id: 'test3', name: 'test 3', icon: 'icon-file-directory',
            children : [
              { id: 'test4', name: 'test 4'},
              { id: 'test5', name: 'test 5'}
            ]
          },
      ]
    }
    this.treeModel = {
      root: root
    };


    let treeView = new UITreeView(this.treeModel);
    let div = createElement('div', { className: 'test-treeview-container'})
    insertElement(div, treeView.element())
    this.stackedPage.setInnerView(div)

    div.style.width = '400px';
    div.style.height = '400px';
    div.style.border = 'solid 1px white';
    **/

  }

}
