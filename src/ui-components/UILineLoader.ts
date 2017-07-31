'use babel'
import {
  createText,
  createElement,
  insertElement,
  createIcon
} from '../element/index';
import { UIBaseComponent } from './UIComponent'
export class UILineLoader extends UIBaseComponent{
  private onLoading:boolean =false;
  constructor(){
    super();
    this.initUI();
  }
  initUI(){
    this.mainElement = createElement('div',{
      className:'status-loading'
    });
  }
  public setOnLoading(value:boolean){
    if(this.onLoading != value){
      this.onLoading = value;
      this.updateUI();
    }
  }
  private updateUI(){
    this.mainElement.classList[this.onLoading ? 'add' : 'remove']('active')
  }
}
