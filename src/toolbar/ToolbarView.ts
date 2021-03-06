'use babel'

/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */

import { parse } from 'path';
import { EventEmitter }  from 'events';
import { get } from 'lodash';

const { CompositeDisposable } = require('atom');
import {
  createText,
  createElement,
  insertElement,
  createGroupButtons,
  createButton,
  createIcon,
  createIconFromPath,
  attachEventFromObject
} from '../element/index';
import { UIRunSelectorComponent } from '../ui-components/UIRunSelectorComponent'
import { UIStatusIndicatorComponent, UIIndicatorStatus } from '../ui-components/UIStatusIndicatorComponent'


export interface ToolbarOptions {
  didNewProject?: Function,
  didRun?: Function,
  didStop?: Function,
  didBuild?: Function,
  didReload?:Function,
  didOpenJSConsole?:Function,
  didProjectSettings?: Function,
  didToggleToolbar?: Function,
  didToggleDebugArea?: Function
  didSelectProjectForRun?: Function,
  didToggleConsole?: Function,
  didSelectTaskClick?:Function,
  didTaskSelected?:Function
}


export interface ToolbarStatus {
  btnRunEnable?:boolean
  btnStopEnable?:boolean
  btnReloadEnable?:boolean
  btnOpenJSConsoleEnable?:boolean
  prjSelectorEnable?:boolean
  progressStatus?: UIIndicatorStatus
  progressMsg?: string
  progressIcon?: string
}

export class ToolbarView {

  private element: HTMLElement;
  private events: EventEmitter;
  private subscriptions:any = new CompositeDisposable();

  private newProjectButton: HTMLElement;
  private runButton: HTMLElement;
  private stopButton: HTMLElement;
  private logoElement: HTMLElement;
  private buildButton: HTMLElement;
  private runSelector:UIRunSelectorComponent;
  private statusIndicator: UIStatusIndicatorComponent;
  private reloadButton: HTMLElement;
  private openJSConsoleButton: HTMLElement;

  private toolbarElement: HTMLElement;
  private toolbarAnchor: HTMLElement;

  private isVisible: boolean;

  constructor (options: ToolbarOptions) {
    this.events = new EventEmitter();

    this.toolbarElement = createElement('de-workbench-toolbar');
 
    this.logoElement = createIcon('logo')
    insertElement(this.toolbarElement, this.logoElement)

    this.newProjectButton = createButton({
      click: () => {
        this.events.emit('didNewProject');
      }
    },[
      createIcon('newproj')
    ]);
    atom["tooltips"].add(this.newProjectButton, {title:'Create a New Project'})
    insertElement(this.toolbarElement, this.newProjectButton)

    this.buildButton = createButton({
      disabled: false,
      click: () => {
        this.events.emit('didProjectSettings');
      }
    },[
      createIcon('build')
    ]);
    atom["tooltips"].add(this.buildButton, {title:'Open Project Settings'})
    insertElement(this.toolbarElement, this.buildButton)

    this.createRunComponents();
    this.createStatusIndicator();

    // toggle panes
    let toggleButtons = this.createToogleButtons();
    toggleButtons.classList.add('bugs-toggle-buttons')
    insertElement(this.toolbarElement, toggleButtons)

    attachEventFromObject(this.events, [
      'didRun',
      'didStop',
      'didReload',
      'didOpenJSConsole',
      'didNewProject',
      'didBuild',
      'didToggleToolbar',
      'didToggleDebugArea',
      'didProjectSettings',
      'didSelectProjectForRun',
      'didSelectTaskClick',
      'didTaskSelected',
      'didToggleConsole'
    ], options);
    
    this.toolbarAnchor = createElement('de-workbench-toolbar-anchor',{
      elements: [
        createElement('span', {
          elements: [ createText(' ')]
        })
      ]
    });
    this.toolbarAnchor.addEventListener('click',()=>{
      this.toggle();
    })

    this.element = createElement('de-workbench-toolbar-container',{
      elements: [ this.toolbarElement, this.toolbarAnchor ]
    })

    this.isVisible = true;
  }

  private toggleAtomTitleBar (value: boolean) {
    let titleBar = document.querySelector('atom-panel .title-bar') as HTMLElement
    if (get(titleBar, 'nodeType', false) && titleBar.parentNode) {
      (<HTMLElement> titleBar.parentNode).style.display = value ? null : 'none'
    }
  }

  private createRunComponents(){

    let runContainer:HTMLElement = createElement('div',{
      className:"de-workbench-uiruncomponent"
    });

    this.runButton = createButton({
      click: () => {
        this.events.emit('didRun');
      }
    },[
      createIcon('run')
    ]);
    insertElement(runContainer, this.runButton)


    this.stopButton = createButton({
      disabled: true,
      click: () => {
        this.events.emit('didStop');
      }
    },[
      createIcon('stop')
    ]);
    insertElement(runContainer, this.stopButton)

    this.runSelector = new UIRunSelectorComponent(this.events);
    insertElement(runContainer,this.runSelector.element());

    this.reloadButton = createButton({
      disabled: true,
      click: () => {
        this.events.emit('didReload');
      }
    },[
      createIcon('refresh')
    ]);
    insertElement(runContainer, this.reloadButton)


    this.openJSConsoleButton = createButton({
      disabled: true,
      click: () => {
        this.events.emit('didOpenJSConsole');
      }
    },[
      createIcon('zap')
    ]);
    insertElement(runContainer, this.openJSConsoleButton)

    insertElement(this.toolbarElement,runContainer);
  }

  private createStatusIndicator(){
    this.statusIndicator = new UIStatusIndicatorComponent("No task in progress");
    insertElement(this.toolbarElement,this.statusIndicator.element());
  }

  public toggle(){
    if (this.isVisible){
      this.isVisible = false;
      this.toolbarElement.style.display = "none";
      this.toolbarAnchor.style.display = "block";
    } else {
      this.isVisible = true;
      this.toolbarElement.style.display = "block";
      this.toolbarAnchor.style.display = "none";
    }
  }

  private createToogleButtons():HTMLElement{
    return createGroupButtons([
      createButton({
        tooltip: {
          subscriptions: this.subscriptions,
          title: 'Toggle Toolbar'
        },
        click: () => this.events.emit('didToggleToolbar')
      }, [createIcon('up-arrow')]),
      createButton({
        tooltip: {
          subscriptions: this.subscriptions,
          title: 'Toggle Console'
        },
        click: () => this.events.emit('didToggleConsole')
      }, [createIcon('panel-bottom')]),
      createButton({
        tooltip: {
          subscriptions: this.subscriptions,
          title: 'Toggle Debug Area'
        },
        click: () => this.events.emit('didToggleDebugArea')
      }, [createIcon('panel-right')])
    ]);
  }

  public displayAsTitleBar () {
    this.toggleAtomTitleBar(false)
    this.toolbarElement.classList.add('bugs-title-bar')
  }

  public displayDefault () {
    this.toggleAtomTitleBar(true)
    this.toolbarElement.classList.remove('bugs-title-bar')
  }

  public setTaskConfiguration(configuration){
    this.runSelector.setTaskConfiguration(configuration);
  }

  public destroy () {
    this.toolbarElement.remove();
    this.toolbarAnchor.remove();
    this.element.remove();
    this.subscriptions.dispose();
  }

  public getElement (): HTMLElement {
    return this.element;
  }

  // Utilities:
  public setInProgressStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Busy,msg,iconName || 'status-warning');
    this.runButton.setAttribute('disabled','true');
    this.stopButton.removeAttribute('disabled');
  }
  public setSuccessStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Success,msg,iconName || 'status-success');
    this.stopButton.setAttribute('disabled','true');
    this.runButton.removeAttribute('disabled');
  }
  public setIdleStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Idle,msg,iconName);
    this.stopButton.setAttribute('disabled','true');
    this.runButton.removeAttribute('disabled');
  }
  public setErrorStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Error,msg,iconName || 'status-error');
    this.stopButton.setAttribute('disabled','true');
    this.runButton.removeAttribute('disabled');
  }

  /**
   * Update the progress indicator
   * @param  {ToolbarStatus} status [description]
   * @return {[type]}               [description]
   */
  public updateStatus(status:ToolbarStatus){
    if(status.btnReloadEnable != null){
      this.updateButtonStatus(this.reloadButton,status.btnReloadEnable);
    }
    if(status.btnOpenJSConsoleEnable != null){
      this.updateButtonStatus(this.openJSConsoleButton,status.btnOpenJSConsoleEnable);
    }
    if(status.btnStopEnable != null){
      this.updateButtonStatus(this.stopButton,status.btnStopEnable);
    }
    if(status.btnRunEnable != null){
      this.updateButtonStatus(this.runButton,status.btnRunEnable);
    }
    if(status.prjSelectorEnable != null){
      this.runSelector.setEnable(false);
    }
    if(status.progressStatus != null){
      this.statusIndicator.setStatus(status.progressStatus);
    }
    if(status.progressMsg != null ){
      this.statusIndicator.setText(status.progressMsg,status.progressIcon);
    }
  }

  private updateButtonStatus(element:HTMLElement,enabled:boolean){
    if(!element){
      throw new Error("updateButtonStatus fail: element is null");
    }
    if(enabled){
      element.removeAttribute('disabled');
    }else{
      element.setAttribute('disabled','true');
    }
  }

}
