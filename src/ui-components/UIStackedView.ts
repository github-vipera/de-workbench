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

export interface UIStackedViewOptions {
    titleIconClass?:string;
    subtle?:string;
}

export class UIStackedView extends UIBaseComponent {

    protected title:string;
    protected iconClassName:string;
    protected innerView:HTMLElement;
    protected subtleView:HTMLElement;

    protected titleElement: Text;
    protected titleIcon: HTMLElement;
    protected headerElement: HTMLElement;

    protected options:UIStackedViewOptions;

    constructor(options?:UIStackedViewOptions){
      super();
      this.options = options;
      this.buildUI();
    }

    protected buildUI(){
      // create the header
      this.titleElement = createText('');

      let titleIconClassName = 'icon ';
      if (this.options && this.options.titleIconClass){
        titleIconClassName = titleIconClassName +" " + this.options.titleIconClass
      }
      this.titleIcon = createElement('a',{
        className : titleIconClassName
      })

      this.headerElement = createElement('div',{
        elements : [
          this.titleIcon,
          this.titleElement
        ],
        className : "de-workbench-stacked-view-header-section section-heading"
      });

      if (this.options && this.options.subtle){
        let subtleEl = createElement('div',{
          elements: [
            createText(this.options.subtle)
          ],
          className: "de-workbench-stacked-view-header-section section-heading-subtle text-subtle text-smaller"
        })
        insertElement(this.headerElement, subtleEl)
      }

      // the main element
      this.mainElement = createElement('div',{
        elements : [
          this.headerElement
        ],
        className : "de-workbench-stacked-view"
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

    public destroy(){
      super.destroy();
    }


}
