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
  createModalActionButtons,
  createOption
} from '../../element/index';
import { UIModalView } from '../../ui-components/UIModalView'
import { UIComponent, UIBaseComponent } from '../../ui-components/UIComponent'
import { UIButtonGroup,UIButtonGroupMode,UIButtonConfig } from '../../ui-components/UIButtonGroup'
export class TaskConfigView extends UIModalView {
  constructor(title:string){
    super(title);
    this.initUI();
  }
  initUI(){

  }

  addFooter(){
    let actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
      .addButton(new UIButtonConfig()
            .setId('cancel')
            .setCaption('Cancel')
            .setClickListener(()=>{
                this.close();
            }))
      .addButton(new UIButtonConfig()
            .setId('create')
            .setButtonType('success')
            .setCaption('Create')
            .setClickListener(()=>{

            }))
      let modalActionButtons = createModalActionButtons(actionButtons.element());
      insertElement(this.modalContainer, modalActionButtons);
  }

  close(){
    super.hide();
    this.destroy();
  }

}
