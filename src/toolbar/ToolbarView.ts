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
  didProjectSettings?: Function,
  didToggleToolbar?: Function,
  didToggleDebugArea?: Function
  didSelectProjectForRun?: Function,
  didToggleConsole?: Function,
  didSelectTaskClick?:Function
  /**
  didOpenScheme?: Function,
  didRun?: Function,
  didChangePath?: Function,
  didStop?: Function,
  didToggleConsole?: Function,
  didToggleDebugArea?: Function
  **/
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

  constructor (options: ToolbarOptions) {
    this.events = new EventEmitter();
    this.element = createElement('de-workbench-toolbar');

    this.logoElement = createIcon('logo')
    insertElement(this.element, this.logoElement)

    //<Label class="fa" text="\uf293"></Label>
    /*let testFA = createElement('a',{
      elements: [ createText('pippo')],
      className : "fa"
    })
    testFA.setAttribute("text","\uf293")
    insertElement(this.element, testFA)*/

    this.newProjectButton = createButton({
      click: () => {
        this.events.emit('didNewProject');
      }
    },[
      createIcon('newproj')
    ]);
    insertElement(this.element, this.newProjectButton)

    this.buildButton = createButton({
      disabled: false,
      click: () => {
        this.events.emit('didProjectSettings');
      }
    },[
      createIcon('build')
    ]);
    insertElement(this.element, this.buildButton)

    this.createRunComponents();
    this.createStatusIndicator();

    // toggle panes
    let toggleButtons = this.createToogleButtons();
    toggleButtons.classList.add('bugs-toggle-buttons')
    insertElement(this.element, toggleButtons)


    attachEventFromObject(this.events, [
      'didRun',
      'didStop',
      'didNewProject',
      'didBuild',
      'didToggleToolbar',
      'didToggleDebugArea',
      'didProjectSettings',
      'didSelectProjectForRun',
      'didSelectTaskClick',
      'didToggleConsole'
    ], options);

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

    insertElement(this.element,runContainer);
  }

  private createStatusIndicator(){
    this.statusIndicator = new UIStatusIndicatorComponent("No task in progress");
    insertElement(this.element,this.statusIndicator.element());
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
    this.element.classList.add('bugs-title-bar')
  }

  public displayDefault () {
    this.toggleAtomTitleBar(true)
    this.element.classList.remove('bugs-title-bar')
  }

  public setTaskConfiguration(configuration){
    this.runSelector.setTaskConfiguration(configuration);
  }

  public destroy () {
    this.element.remove();
    this.subscriptions.dispose();
  }

  public getElement (): HTMLElement {
    return this.element;
  }

  // Utilities:
  public setInProgressStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Busy,msg,iconName || 'status-warning');
  }
  public setSuccessStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Success,msg,iconName || 'status-success');
  }
  public setIdleStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Idle,msg,iconName);
  }
  public setErrorStatus(msg:string,iconName?:string){
    this.statusIndicator.setStatus(UIIndicatorStatus.Busy,msg,iconName || 'status-error');
  }

}
