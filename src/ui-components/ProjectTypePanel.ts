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


export class ProjectTypePanel {

  private mainElement:HTMLElement;

  private iconProjectType: HTMLElement;
  private txtProjectType: Text;
  private txtProjectName: Text;

  constructor(){
    this.buildUI();
  }

  private buildUI(){
    this.iconProjectType = createIcon('apache-cordova-big');
    this.txtProjectType = createText('Cordova Project');
    this.txtProjectName = createText('--');
    this.mainElement =  createElement('div', {
        elements: [
                    this.iconProjectType,
                    this.txtProjectType,
                    this.txtProjectName
                   ],
        className:"de-workbench-project-info-container"
    })
  }

  public setProjectType(projectType:string){
      if (projectType==='cordova'){
        this.iconProjectType.className = 'dewb-icon dewb-icon-apache-cordova-big';
        this.txtProjectType.textContent = "Cordova Project";
      } else {
        this.iconProjectType.className = '';
        this.txtProjectType.textContent = "Unknown Project Type";
      }
  }

  public setProjectInfo(projectInfo:any){
      this.txtProjectName.textContent = projectInfo.name;
  }

  public element(){
    return this.mainElement;
  }


}
