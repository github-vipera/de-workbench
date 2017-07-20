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

export class UISelectButton extends UIBaseComponent implements UISelectListener {
  private select:UISelect;
  private txtSelected:Text;
  private selectedItem:UISelectItem;
  constructor(select:UISelect){
    super();
    this.select=select;
    this.selectedItem=null;
    this.select.addSelectListener(this);
    this.initUI();
  }
  initUI():void{
    this.txtSelected = createText("Select project");
    this.mainElement = createButton({
      className:"select-btn"
    },[
      this.txtSelected,
      this.select.element(),
      createElement('div', {
        className: 'bugs-scheme-arrow'
      })
    ]);
  }

  setSelectedItem(value:string){
    this.selectedItem = find(this.select.getItems(),(item:UISelectItem) => {
      return item.value == value;
    });
    if(!this.selectedItem){
      this.txtSelected.textContent = "Select project";
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
      this.txtSelected.textContent = "Select project";
      return;
    }
    this.txtSelected.textContent = this.selectedItem.name;
  }



}
