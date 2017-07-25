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
import { UISelect, UISelectListener,UISelectItem} from './UISelect'
import {find} from 'lodash'

export interface UISelectButtonOptions {
  withArrow?:boolean
  leftIcon?:string,
  rightIcon?:string
}

export class UISelectButton extends UIBaseComponent implements UISelectListener {
  private select:UISelect;
  private txtSelected:Text;
  private selectedItem:UISelectItem;
  private emptyText:string;
  private uiOptions:UISelectButtonOptions;
  constructor(select:UISelect,emptyText:string,options?:UISelectButtonOptions){
    super();
    this.select=select;
    this.emptyText = emptyText;
    this.selectedItem=null;
    this.uiOptions = options || {};
    this.select.addSelectListener(this);
    this.initUI();
  }
  initUI():void{
    this.txtSelected = createText(this.emptyText);
    let elements:Array<Text | HTMLElement> = [
      this.txtSelected,
      this.select.element(),
    ];
    if(this.uiOptions.withArrow){
      elements[elements.length] = createElement('div', {
        className: 'bugs-scheme-arrow'
      })
    }
    this.mainElement = createButton({
      className:"select-btn"
    },elements);
  }

  setSelectedItem(value:string){
    this.selectedItem = find(this.select.getItems(),(item:UISelectItem) => {
      return item.value == value;
    });
    if(!this.selectedItem){
      this.txtSelected.textContent = this.emptyText;
      this.selectedItem = null;
      return;
    }
    this.txtSelected.textContent = this.selectedItem.name;
    this.select.setSelectedItem(this.selectedItem.value);
  }

  onItemSelected(value:string){
    //this.txtSelected.textContent = value;
    this.selectedItem = find(this.select.getItems(),(item:UISelectItem) => {
      return item.value == value;
    });
    if(!this.selectedItem){
      this.txtSelected.textContent = this.emptyText;
      return;
    }
    this.txtSelected.textContent = this.selectedItem.name;
  }



}
