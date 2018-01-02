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
 } from '../../element/index';

import { EventEmitter }  from 'events'
import { UIPane } from '../../ui-components/UIPane'

import * as atomUI from 'de-workbench-atom-ui';

export class UIDebugBlock extends UIPane {

  //private _uiCreator:UICCreator;

  constructor (uri:string) {
    super(uri, "Debug Block")
  }

  /**
   * Initialize the UI
   */
  protected createUI() {

    let content = this.createUIBlock();

    // Create the main UI
    let element = createElement('div',{
      elements : [
        content
      ],
      className: 'de-workbench-debug-area-block-container'
    });

    let myLabel = atomUI.createLabel("Pippo e pluto")
    atomUI.insertElement(element, myLabel)

    let button = new atomUI.UIEditableLabel({
      caption: "Pippo",
      className: 'foo-class',
      editable: true
    })
    atomUI.insertElement(element, button.element())

    let fooComponent = new atomUI.UIFooComponent();
    atomUI.insertElement(element, fooComponent.element())
    

    /**
    let sc = new coreui.BareComponent();
    let hw = new coreui.deworkbench.HelloWorld()
    let foo = new coreui.FooComponent();
    insertElement(element, foo.getElement());
    **/

    /*
    this._uiCreator = new UICCreator();
    insertElement(element, this._uiCreator.element());
    **/

    /*
    let draggable = createElement("div", {
      elements: [ createText("Drag Me")],
      className : 'uic-draggable uic-box'
    })
    insertElement(element, draggable);

    interact(draggable)
      .draggable({
        // call this function on every dragmove event
        onmove: (event)=>{
          var target = event.target,
                 // keep the dragged position in the data-x/data-y attributes
                 x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                 y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

             // translate the element
             target.style.webkitTransform =
             target.style.transform =
               'translate(' + x + 'px, ' + y + 'px)';

             // update the posiion attributes
             target.setAttribute('data-x', x);
             target.setAttribute('data-y', y);
        },
      })
      .resizable({
        inertia: true
      });
      **/

    return element;
  }

  protected createUIBlock():HTMLElement {
    throw ("Invalid implementation. Override this method in subclass.")
  }

}
