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
 } from '../../../element/index';

 import { EventEmitter }  from 'events'
 import { Logger } from '../../../logger/Logger'
 import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
 import { UISelect, UISelectItem, UISelectListener } from '../../../ui-components/UISelect'
 import { UIInputFormElement, UISelectFormElement } from '../../../ui-components/UIInputFormElement'
 import { AbstractAppSignatureEditorCtrl } from './AbstractAppSignatureEditorCtrl'

export class IOSAppSignatureEditorCtrl extends AbstractAppSignatureEditorCtrl {

  private provisioningProfileSelect:UISelectFormElement;
  private packageTypeSelect:UISelectFormElement;
  private devTeamInput:UIInputFormElement;
  private codeSignIdentityInput:UIInputFormElement;

  constructor(){
    super();
  }

  protected createControls():Array<HTMLElement> {
    this.devTeamInput = new UIInputFormElement().setCaption('Development Team').setPlaceholder('Development Team').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    })
    this.codeSignIdentityInput = new UIInputFormElement().setCaption('Code Sign Identity').setPlaceholder('Code Sign Identity').addEventListener('change',(evtCtrl:UIInputFormElement)=>{
    })
    this.provisioningProfileSelect = new UISelectFormElement();
    this.packageTypeSelect = new UISelectFormElement();
    this.packageTypeSelect.setItems(this.getPackageTypeItems());

    return [this.provisioningProfileSelect.element(), this.devTeamInput.element(), this.codeSignIdentityInput.element(), this.packageTypeSelect.element()];
  }

  protected getPackageTypeItems():Array<UISelectItem>{
    return [
        { value: "developement",
          name: "Developement"
        },
        { value: "adhoc",
          name: "Ad-Hoc"
        },
        { value: "enterprise",
          name: "Enterprise"
        },
        { value: "appstore",
          name: "AppStore"
        }
    ]
  }

  public destroy(){
    this.provisioningProfileSelect.destroy();
    this.packageTypeSelect.destroy();
    this.devTeamInput.destroy();
    this.codeSignIdentityInput.destroy();
    super.destroy();
  }

}
