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

import { UIInputFormElement } from './UIInputFormElement'
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from './UIButtonGroup'


export enum FormActionType {
    Cancel = 0,
    Commit = 1
}

export interface FormActionsOptions {
  cancel: {
    caption:string;
  },
  commit: {
    caption:string;
  },
  actionListener:any;
}

export class UICommonsFactory {

  public static createFormActions(options:FormActionsOptions):HTMLElement {
    //Action buttons

    let actionButtons = new UIButtonGroup(UIButtonGroupMode.Standard)
      .addButton(new UIButtonConfig()
            .setId('cancel')
            .setCaption(options.cancel.caption /*'Revert Changes'*/)
            .setClickListener(()=>{
                options.actionListener(FormActionType.Cancel)
            }))
      .addButton(new UIButtonConfig()
            .setId('saveChanges')
            .setButtonType('success')
            .setCaption(options.commit.caption /*'Save changes'*/)
            .setClickListener(()=>{
              options.actionListener(FormActionType.Commit)
            }))
    let actionButtonsContainer = createElement('div',{
      elements: [
        actionButtons.element()
      ],
      className: 'de-workbench-ui-form-action-buttons'
    });

    let mainContainer = createElement('div',{
      elements: [actionButtonsContainer],
      className: 'de-workbench-ui-form-action-buttons-container'
    })

    return mainContainer;
  }

  public static createFormSeparator():HTMLElement {
    //<hr class="form-divider" width="100%" size="1" style="border-top: 1px solid #606060;">
    let divider = createElement('hr',{
      className: 'form-divider de-workbench-ui-form-divider'
    })
    return divider;
  }

  public static createFormSectionTitle(title:string):HTMLElement {
    let divider = createElement('h2',{
      elements: [
        createText(title)
      ],
      className: 'de-workbench-ui-form-section-title'
    })
    return divider;
  }

}
