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
import { ProjectManager } from '../../../DEWorkbench/ProjectManager'
import { Cordova, CordovaPlatform, CordovaPlugin } from '../../../cordova/Cordova'
import { Logger } from '../../../logger/Logger'
import { UIPluginsList } from '../../../ui-components/UIPluginsList'
import { UIStackedView } from '../../../ui-components/UIStackedView'
import { UITabbedView, UITabbedViewItem, UITabbedViewTabType } from '../../../ui-components/UITabbedView'
import { UIComponent, UIBaseComponent } from '../../../ui-components/UIComponent'
import { UISelect, UISelectItem, UISelectListener } from '../../../ui-components/UISelect'
import { UIInputFormElement, UISelectFormElement } from '../../../ui-components/UIInputFormElement'


export class IOSAppSignatureEditorCtrl extends UIBaseComponent {

  private provisioningProfileSelect:UISelectFormElement;
  private packageTypeSelect:UISelectFormElement;
  private devTeamInput:UIInputFormElement;
  private codeSignIdentityInput:UIInputFormElement;

  constructor(){
    super();
    this.initUI();
  }

  protected initUI(){
    this.devTeamInput = new UIInputFormElement().setCaption('Development Team').setPlaceholder('Development Team').addChangeListener((evtCtrl:UIInputFormElement)=>{
    })
    this.codeSignIdentityInput = new UIInputFormElement().setCaption('Code Sign Identity').setPlaceholder('Code Sign Identity').addChangeListener((evtCtrl:UIInputFormElement)=>{
    })
    this.provisioningProfileSelect = new UISelectFormElement();
    this.packageTypeSelect = new UISelectFormElement();
    this.packageTypeSelect.setItems(this.getPackageTypeItems());

    let sectionContainer = createElement('div',{
      elements: [ this.createBlock('Provisioning Profile', this.provisioningProfileSelect.element()),
                  this.devTeamInput.element(),
                  this.codeSignIdentityInput.element(),
                  this.createBlock('Package Type', this.packageTypeSelect.element())
                ],
      className: 'section-container'
    })

    let mainSection = createElement('div',{
      elements: [ sectionContainer ],
      className: 'section de-wb-signature-editor-crtl-container'
    })

    this.mainElement = mainSection;
  }

  protected createBlock(title:string, element:HTMLElement):HTMLElement {
      let block = createElement('div',{
        elements: [
          createElement('label',{
            elements: [createText(title)]
          }),
          element
        ],
        className: 'block control-group'
      })
      return block;
  }

  public destroy(){
      super.destroy();
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
}
