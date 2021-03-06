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

import { UIDebugBlock } from './UIDebugBlock'
import { UIExtComponent } from '../../ui-components/UIComponent'
import { CallStackFrame, CallStackFrames } from '../../DEWorkbench/debugger/DebuggerCommons'
import { parse } from 'path'

const { CompositeDisposable } = require('atom')

export class DebugCallStackView extends UIDebugBlock {

  private toolbar:DebugToolbar
  private callStackContentElement: HTMLElement

  constructor (params:any) {
    super(params)
  }

  /**
   * Initialize the UI
   */
   protected createUIBlock():HTMLElement {

     this.toolbar = new DebugToolbar()
     this.toolbar.addEventListener('didPause',()=>{
       //alert("didPause")
     })

     this.callStackContentElement = createElement('de-workbench-debug-group-content', {
       className: 'callstack'
     })

     let el = createElement('div', {
       elements: [ this.toolbar.element(),  this.callStackContentElement ]
     })
     return el;
   }

   insertCallStackFromFrames (frames: CallStackFrames) {
     this.clearCallStack()
     frames.forEach((frame, index) => {
       return insertElement(this.callStackContentElement,
         this.createFrameLine(frame, index === 0))
     })
   }

   clearCallStack () {
     this.callStackContentElement.innerHTML = ''
   }

   createFrameLine (frame: CallStackFrame, indicate: boolean) {
     let file = parse(frame.filePath)
     let indicator = createIcon(indicate ? 'arrow-right-solid' : '')
     if (indicate) {
       indicator.classList.add('active')
     }
     return createElement('xatom-debug-group-item', {
       options: {
         click: () => {
           this.fireEvent('didOpenFrame', frame)
           this.fireEvent('didOpenFile',
             frame.filePath,
             frame.lineNumber,
             frame.columnNumber)
         }
       },
       elements: [
         createElement('span', {
           elements: [indicator, createText(frame.name || '(anonymous)')]
         }),
         createElement('span', {
           className: 'file-reference',
           elements: [
             createText(file.base),
             createElement('span', {
               className: 'file-position',
               elements: [ createText(`${frame.lineNumber + 1}${ frame.columnNumber > 0 ? ':' + frame.columnNumber : '' }`) ]
             })
           ]
         })
       ]
     })
   }


}


class DebugToolbar extends UIExtComponent {

  private pauseButton: HTMLElement
  private resumeButton: HTMLElement
  private stepOverButton: HTMLElement
  private stepIntoButton: HTMLElement
  private stepOutButton: HTMLElement;
  private subscriptions:any = new CompositeDisposable()


  constructor(){
    super();
    this.initUI();
  }

  protected initUI(){

    this.pauseButton = createButton({
       click: () => {
         this.fireEvent('didPause')
       }
     }, [createIcon('pause'), createText('Pause')])

     this.resumeButton = createButton({
       click: () => {
         this.fireEvent('didResume')
       }
     }, [createIcon('resume'), createText('Resume')])

     this.stepOverButton = createButton({
       tooltip: {
         subscriptions: this.subscriptions,
         title: 'Step Over'
       },
       click: () => {
         this.fireEvent('didStepOver')
       }
     }, [createIcon('step-over')])

     this.stepIntoButton = createButton({
       tooltip: {
         subscriptions: this.subscriptions,
         title: 'Step Into'
       },
       click: () => {
         this.fireEvent('didStepInto')
       }
     }, [createIcon('step-into')])

     this.stepOutButton = createButton({
       tooltip: {
         subscriptions: this.subscriptions,
         title: 'Step Out'
       },
       click: () => {
         this.fireEvent('didStepOut')
       }
     }, [createIcon('step-out')])

     let toolbarContainer = createElement('de-workbench-debug-controls',{
       elements : [ this.pauseButton, this.resumeButton, this.stepOverButton, this.stepIntoButton, this.stepOutButton]
     })

     this.togglePause(false)

     this.mainElement = toolbarContainer;
  }

  public togglePause (status: boolean) {
    this.resumeButton.style.display = status ? null : 'none'
    this.pauseButton.style.display = status ? 'none' : null
  }


}
