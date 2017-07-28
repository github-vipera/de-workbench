'use babel'
import {
  createText,
  createElement,
  insertElement,
  createIcon
} from '../element/index';
import { UIComponent, UIBaseComponent } from './UIComponent'


export enum UIIndicatorStatus {
  Idle,
  Busy,
  Success,
  Error
}

export class UIStatusIndicatorComponent extends UIBaseComponent{
  private status:UIIndicatorStatus;
  private textElement:HTMLElement;
  private loadingElement:HTMLElement;
  constructor(initialMsg?:string){
    super();
    this.status= UIIndicatorStatus.Idle;
    this.initUI(initialMsg);
  }
  private initUI(initialMsg:string){
    this.createLoadingElement();
    this.createTextElement(initialMsg);
    this.createMainElement();
  }
  private createLoadingElement(){
    this.loadingElement = createElement('div', {
      className: 'status-loading'
    });
  }
  private createTextElement(msg:string){
    this.textElement = createElement('span', {
      className: 'status-text'
    });
    this.updateTextElementContent(msg);
  }

  private updateTextElementContent(msg:string,iconName?:string){
    let elements =[];
    if(iconName){
      elements[0] = createIcon(iconName);
    }
    elements[elements.length] = createText(msg || "");
    this.textElement.innerHTML = '';
    insertElement(this.textElement,elements);
  }

  private createMainElement(){
    this.mainElement = createElement('div',{
      className:'de-workbench-status-container',
      elements:[
        this.loadingElement,
        this.textElement
      ]
    });
  }
  private updateInternalStatus(oldValue:UIIndicatorStatus,newValue:UIIndicatorStatus,message:string,iconName:string){
    this.status = newValue;
    this.setOnLoading(newValue == UIIndicatorStatus.Busy);
    this.updateTextElementContent(message,iconName);
  }

  private setOnLoading(value:boolean){
    this.loadingElement.classList[value ? 'add' : 'remove']('active')
  }

  public setStatus(status:UIIndicatorStatus, message:string,iconName?:string){
    this.updateInternalStatus(this.status,status,message,iconName);
  }

  public setText(message:string,iconName?:string){
    this.updateTextElementContent(message,iconName);
  }
}
