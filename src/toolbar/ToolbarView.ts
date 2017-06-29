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

export interface ToolbarOptions {
  didNewProject?: Function,
  didRun?: Function,
  didStop?: Function,
  didBuild?: Function,
  didToggleToolbar?: Function,
  didTogglePrjInspector?: Function,
  didToggleDebugArea?: Function
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

  constructor (options: ToolbarOptions) {
    this.events = new EventEmitter();
    this.element = createElement('de-workbench-toolbar');

    this.logoElement = createIcon('logo')
    insertElement(this.element, this.logoElement)

    this.newProjectButton = createButton({
      click: () => {
        this.events.emit('didNewProject');
      }
    },[
      createIcon('newproj')
    ]);
    insertElement(this.element, this.newProjectButton)


    this.runButton = createButton({
      click: () => {
        this.events.emit('didRun');
      }
    },[
      createIcon('run')
    ]);
    insertElement(this.element, this.runButton)


    this.stopButton = createButton({
      disabled: true,
      click: () => {
        this.events.emit('didStop');
      }
    },[
      createIcon('stop')
    ]);
    insertElement(this.element, this.stopButton)


    this.buildButton = createButton({
      disabled: true,
      click: () => {
        this.events.emit('didBuild');
      }
    },[
      createIcon('build')
    ]);
    insertElement(this.element, this.buildButton)


    // toggle panes
    let toggleButtons = createGroupButtons([
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
          title: 'Toggle Project Inspector'
        },
        click: () => this.events.emit('didTogglePrjInspector')
      }, [createIcon('sort')]),
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
    ])
    toggleButtons.classList.add('bugs-toggle-buttons')
    insertElement(this.element, toggleButtons)


    attachEventFromObject(this.events, [
      'didRun',
      'didStop',
      'didNewProject',
      'didBuild',
      'didToggleToolbar',
      'didTogglePrjInspector',
      'didToggleDebugArea'
    ], options);

  }

  private toggleAtomTitleBar (value: boolean) {
    let titleBar = document.querySelector('atom-panel .title-bar') as HTMLElement
    if (get(titleBar, 'nodeType', false) && titleBar.parentNode) {
      (<HTMLElement> titleBar.parentNode).style.display = value ? null : 'none'
    }
  }

  public displayAsTitleBar () {
    this.toggleAtomTitleBar(false)
    this.element.classList.add('bugs-title-bar')
  }

  public displayDefault () {
    this.toggleAtomTitleBar(true)
    this.element.classList.remove('bugs-title-bar')
  }


  public destroy () {
    this.element.remove();
    this.subscriptions.dispose();
  }

  public getElement (): HTMLElement {
    return this.element;
  }

}
