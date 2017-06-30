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
  private txtProjectVersion: Text;

  constructor(){
    this.buildUI();
  }

  private buildUI(){
    this.iconProjectType = createIcon('apache-cordova-big');
    this.txtProjectType = createText('Cordova Project');
    this.txtProjectName = createText('--');
    this.txtProjectVersion = createText('--');

    let propertyListElement = createElement('ul',{
        elements: [
            createElement('li',{ elements: [ this.txtProjectName ]}),
            createElement('li',{ elements: [ this.txtProjectVersion ]})
        ]
    });

    this.mainElement =  createElement('div', {
        elements: [
                    this.iconProjectType,
                    this.txtProjectType,
                    propertyListElement
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
    if (projectInfo){
      this.txtProjectName.textContent = "Name: " + projectInfo.name;
      this.txtProjectVersion.textContent = "Version: " + projectInfo.version;
    }
  }

  public element(){
    return this.mainElement;
  }


}
