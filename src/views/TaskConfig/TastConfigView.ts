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
import { TaskViewPanel } from './TaskViewPanel';
import { EventEmitter }  from 'events';
import { CordovaProjectInfo } from '../../cordova/Cordova';
export class TaskConfigView extends UIModalView {
  taskPanel:TaskViewPanel;
  events:EventEmitter;

  constructor(title:string,events:EventEmitter){
    super(title);
    this.events=events;
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
            .setId('run')
            .setButtonType('success')
            .setCaption('Run')
            .setClickListener(()=>{
              let taskConfig = this.taskPanel.getConfiguration();
              this.events.emit("didRunTask",taskConfig);
              this.close();
            }))
      let modalActionButtons = createModalActionButtons(actionButtons.element());
      insertElement(this.modalContainer, modalActionButtons);
  }

  close(){
    super.hide();
    this.destroy();
  }

  addContent():void{
    this.taskPanel= new TaskViewPanel();
    insertElement(this.modalContainer,this.taskPanel.element());
  }

  setProject(project:CordovaProjectInfo){
    this.taskPanel.setProject(project);
  }

}
