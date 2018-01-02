'use babel'
import {
  createText,
  createElement,
  insertElement,
  createGroupButtons,
  createButton,
  createIcon,
  createIconFromPath,
  attachEventFromObject,
  createTextEditor,
  createSelect,
  createOption
} from '../element/index';

import { UIComponent, UIBaseComponent } from './UIComponent'
import * as _ from 'lodash'

export interface UISelectItem {
  name:string,
  value:string,
  userData?:any;
}

export interface UISelectListener {
  onItemSelected(value:string)
}

export class UISelect extends UIBaseComponent {
  private items:Array<UISelectItem>
  private listeners:Array<UISelectListener> = [];
  constructor(items?:Array<UISelectItem>){
    super();
    this.items = items || [];
    this.updateUI();
  }
  updateUI(){
    let options:HTMLElement[]=this.createOptions(this.items);
    if(!this.mainElement){
      this.mainElement = createSelect(options);
      this.mainElement.addEventListener('change',this.onChange.bind(this),false);
    }else{
      let el:Node;
      while((el = this.mainElement.firstChild) != null){
        this.mainElement.removeChild(el);
      }
      options.forEach((item) => {
        this.mainElement.appendChild(item);
      });
    }
  }

  onChange(evt:any){
    _.forEach(this.listeners,(single:UISelectListener) => {
      single.onItemSelected(this.mainElement['value'])
    });
  }

  getItems(){
    return this.items;
  }

  setItems(items:Array<UISelectItem>){
    this.items = items;
    this.updateUI();
  }

  addSelectListener(listener:UISelectListener){
    this.listeners.push(listener);
  }

  removeSelectListener(listener:UISelectListener){
    this.listeners = _.remove(this.listeners,function(item){
      return item == listener;
    });
  }

  createOptions(items:Array<UISelectItem>):HTMLElement[]{
    let options=[];
    items.forEach((item:UISelectItem) => {
      options.push(createOption(item.name,item.value));
    });
    return options;
  }

  setSelectedItem(value:string){
    this.mainElement['value'] = value;
  }

  getSelectedItem():string{
    return this.mainElement['value'];
  }

  resetSelection(){
    this.mainElement['selectedIndex'] = -1;
  }

  setEnable(value:boolean){
    if(!value){
      this.mainElement.setAttribute('disabled','true');
    }else{
      this.mainElement.removeAttribute('disabled');
    }
  }

}
