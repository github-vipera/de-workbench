'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

 import {
   createText,
   createLabel,
   createBlock,
   createElement,
   insertElement,
   createGroupButtons,
   createButton,
   createIcon,
   createIconFromPath,
   attachEventFromObject,
   createTextEditor,
   createControlBlock
 } from '../../element/index';

import { EventEmitter }  from 'events'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup'
import { UITextEditorExtended } from '../../ui-components/UITextEditorExtended'
import { DEWBResourceManager } from "../../DEWorkbench/DEWBResourceManager"
import { UIBaseComponent, UIComponent } from '../../ui-components/UIComponent'
import { UISelect, UISelectItem } from '../../ui-components/UISelect'

class ProjectTypeInfo {
  public name:string;
  public description : string;
  public templates : Array<string>
}

export class NewProjectTypeSelector extends UIBaseComponent {

  private projectTypeButtons:UIButtonGroup;
  private projectTypes:Array<ProjectTypeInfo>;
  private projectTemplateSection:any;
  private projectTemplateSelector:ProjectTemplateSelector;
  private captionElement:HTMLElement;
  private buttonListener:Function;

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){

    // Project Type Radio
    this.projectTypeButtons = new UIButtonGroup(UIButtonGroupMode.Radio);
    let selectorBlock = createControlBlock('project-type','Project Type',this.projectTypeButtons.element());

    this.buttonListener = (evt)=>{ this.onTypeSelected(evt) }

    // Load project types from resources
    this.projectTypes = DEWBResourceManager.getJSONResource('project_types.json')["projectTypes"];
    for (var i=0;i<this.projectTypes.length;i++){
        let projectType = this.projectTypes[i];
        this.projectTypeButtons.addButton(new UIButtonConfig().setId(projectType.name)
                                                              .setCaption(projectType.description)
                                                              .setSelected(i==0)
                                                              .setClickListener(this.buttonListener))
    }

    // Template selector
    this.projectTemplateSelector = new ProjectTemplateSelector();

    this.mainElement = createElement('div',{
      elements: [
        selectorBlock,
        this.projectTemplateSelector.element()
      ],
      className : 'block'
    })

    //select first type
    this.onTypeSelected(this.projectTypes[0].name)
  }

  private getProjectTypeByName(name:string){
    for (var i=0;i<this.projectTypes.length;i++){
      if (this.projectTypes[i].name===name){
        return this.projectTypes[i];
      }
    }
    return null;
  }

  private onTypeSelected(typeId:string){
    let projectType = this.getProjectTypeByName(typeId);
    if (projectType && projectType.templates && projectType.templates.length>0){
      this.projectTemplateSelector.setTemplates(projectType.templates);
      this.projectTemplateSelector.show()
    } else {
      this.projectTemplateSelector.hide()
    }
  }

  public destroy(){
    this.projectTypes.length = 0;
    this.projectTypes = undefined;
    this.projectTypeButtons.destroy();
    this.projectTypeButtons = undefined;
    this.projectTemplateSection = undefined;
    this.projectTemplateSelector.destroy();
    this.projectTemplateSelector = undefined;
    super.destroy();
  }

  public getProjectType(){
      return this.projectTypeButtons.getSelectedButtons()[0];
  }

  public getTemplateName(){
      return this.projectTemplateSelector.getSelectedTemplate();
  }

}

class ProjectTemplateSelector extends UIBaseComponent {

  //private cmbTemplates:HTMLElement;
  private cmbTemplates:UISelect;

  constructor(){
    super();
    this.initUI();
  }

  private initUI(){

    this.cmbTemplates = new UISelect();

    // Info Label
    let labelInfo = createLabel("In order to create a Ionic project you need to have installed on your computer the Ionic cli utility.To check if it's already installed launch 'ionic help' command into the terminal.");
    labelInfo.classList.add('text-warning')

    let block = createControlBlock('project-template-selector','Project Template', this.cmbTemplates.element(),'settings-view');

    this.mainElement = createElement('div',{
      elements:[
        labelInfo, block
      ]
    })

    this.hide();
  }

  public show(){
    this.mainElement.style.display = "initial";
  }

  public hide(){
    this.mainElement.style.display = "none";
  }

  public destroy(){
    this.cmbTemplates.setItems([]);
    this.cmbTemplates.destroy();
    this.cmbTemplates = undefined;
    super.destroy();
  }

  public setTemplates(templates:Array<string>){
    this.cmbTemplates.setItems([]);
    let items = new Array<UISelectItem>();
    for (var i=0;i<templates.length;i++){
      let item:UISelectItem = {
        name : templates[i],
        value : templates[i],
      };
      items.push(item);
    }
    this.cmbTemplates.setItems(items);
  }

  public getSelectedTemplate():string {
    return this.cmbTemplates.getSelectedItem();
  }



}
