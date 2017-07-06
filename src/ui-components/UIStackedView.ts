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
} from '../element/index';

import { UIComponent, UIBaseComponent } from './UIComponent'

export class UIStackedView extends UIBaseComponent {

    protected title:string;
    protected iconClassName:string;
    protected innerView:HTMLElement;
    protected subtleView:HTMLElement;

    protected titleElement: Text;
    protected titleIcon: HTMLElement;
    protected headerElement: HTMLElement;

    constructor(){
      super();
      this.buildUI();
    }

    protected buildUI(){
      // create the header
      this.titleElement = createText('');

      this.titleIcon = createElement('a',{
        className : 'icon icon-plus'
      })

      this.headerElement = createElement('div',{
        elements : [
          this.titleIcon,
          this.titleElement
        ],
        className : "de-workbench-stacked-view-header-section section-heading"
      });



      // the main element
      this.mainElement = createElement('div',{
        elements : [
          this.headerElement
        ],
        className : "de-workbench-stacked-view section"
      });

    }

    public addHeaderClassName(className:string):UIStackedView {
      this.headerElement.classList.add(className);
      return this;
    }

    public setIconClassName(className:string):UIStackedView{
      this.iconClassName = className;
      //TODO!! change icon
      return this;
    }

    public setTitle(title:string):UIStackedView{
      this.title = title;
      this.titleElement.textContent = title;
      return this;
    }

    public setInnerView(view:HTMLElement):UIStackedView {
      this.innerView = view;
      insertElement(this.mainElement, view);
      return this;
    }

    public setSubtleView(view:HTMLElement):UIStackedView {
      this.subtleView = view;
      //TODO!!
      return this;
    }



}
