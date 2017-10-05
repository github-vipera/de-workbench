'use babel';
import { EventEmitter } from 'events';
import { get } from 'lodash';
const { CompositeDisposable } = require('atom');
import { createText, createElement, insertElement, createGroupButtons, createButton, createIcon, attachEventFromObject } from '../element/index';
import { UIRunSelectorComponent } from '../ui-components/UIRunSelectorComponent';
import { UIStatusIndicatorComponent, UIIndicatorStatus } from '../ui-components/UIStatusIndicatorComponent';
export class ToolbarView {
    constructor(options) {
        this.subscriptions = new CompositeDisposable();
        this.events = new EventEmitter();
        this.toolbarElement = createElement('de-workbench-toolbar');
        this.logoElement = createIcon('logo');
        insertElement(this.toolbarElement, this.logoElement);
        this.newProjectButton = createButton({
            click: () => {
                this.events.emit('didNewProject');
            }
        }, [
            createIcon('newproj')
        ]);
        atom["tooltips"].add(this.newProjectButton, { title: 'Create a New Project' });
        insertElement(this.toolbarElement, this.newProjectButton);
        this.buildButton = createButton({
            disabled: false,
            click: () => {
                this.events.emit('didProjectSettings');
            }
        }, [
            createIcon('build')
        ]);
        atom["tooltips"].add(this.buildButton, { title: 'Open Project Settings' });
        insertElement(this.toolbarElement, this.buildButton);
        this.createRunComponents();
        this.createStatusIndicator();
        let toggleButtons = this.createToogleButtons();
        toggleButtons.classList.add('bugs-toggle-buttons');
        insertElement(this.toolbarElement, toggleButtons);
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
        this.toolbarAnchor = createElement('de-workbench-toolbar-anchor', {
            elements: [
                createElement('span', {
                    elements: [createText(' ')]
                })
            ]
        });
        this.toolbarAnchor.addEventListener('click', () => {
            this.toggle();
        });
        this.element = createElement('de-workbench-toolbar-container', {
            elements: [this.toolbarElement, this.toolbarAnchor]
        });
        this.isVisible = true;
    }
    toggleAtomTitleBar(value) {
        let titleBar = document.querySelector('atom-panel .title-bar');
        if (get(titleBar, 'nodeType', false) && titleBar.parentNode) {
            titleBar.parentNode.style.display = value ? null : 'none';
        }
    }
    createRunComponents() {
        let runContainer = createElement('div', {
            className: "de-workbench-uiruncomponent"
        });
        this.runButton = createButton({
            click: () => {
                this.events.emit('didRun');
            }
        }, [
            createIcon('run')
        ]);
        insertElement(runContainer, this.runButton);
        this.stopButton = createButton({
            disabled: true,
            click: () => {
                this.events.emit('didStop');
            }
        }, [
            createIcon('stop')
        ]);
        insertElement(runContainer, this.stopButton);
        this.runSelector = new UIRunSelectorComponent(this.events);
        insertElement(runContainer, this.runSelector.element());
        this.reloadButton = createButton({
            disabled: true,
            click: () => {
                this.events.emit('didReload');
            }
        }, [
            createIcon('refresh')
        ]);
        insertElement(runContainer, this.reloadButton);
        this.openJSConsoleButton = createButton({
            disabled: true,
            click: () => {
                this.events.emit('didOpenJSConsole');
            }
        }, [
            createIcon('zap')
        ]);
        insertElement(runContainer, this.openJSConsoleButton);
        insertElement(this.toolbarElement, runContainer);
    }
    createStatusIndicator() {
        this.statusIndicator = new UIStatusIndicatorComponent("No task in progress");
        insertElement(this.toolbarElement, this.statusIndicator.element());
    }
    toggle() {
        if (this.isVisible) {
            this.isVisible = false;
            this.toolbarElement.style.display = "none";
            this.toolbarAnchor.style.display = "block";
        }
        else {
            this.isVisible = true;
            this.toolbarElement.style.display = "block";
            this.toolbarAnchor.style.display = "none";
        }
    }
    createToogleButtons() {
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
    displayAsTitleBar() {
        this.toggleAtomTitleBar(false);
        this.toolbarElement.classList.add('bugs-title-bar');
    }
    displayDefault() {
        this.toggleAtomTitleBar(true);
        this.toolbarElement.classList.remove('bugs-title-bar');
    }
    setTaskConfiguration(configuration) {
        this.runSelector.setTaskConfiguration(configuration);
    }
    destroy() {
        this.toolbarElement.remove();
        this.toolbarAnchor.remove();
        this.element.remove();
        this.subscriptions.dispose();
    }
    getElement() {
        return this.element;
    }
    setInProgressStatus(msg, iconName) {
        this.statusIndicator.setStatus(UIIndicatorStatus.Busy, msg, iconName || 'status-warning');
        this.runButton.setAttribute('disabled', 'true');
        this.stopButton.removeAttribute('disabled');
    }
    setSuccessStatus(msg, iconName) {
        this.statusIndicator.setStatus(UIIndicatorStatus.Success, msg, iconName || 'status-success');
        this.stopButton.setAttribute('disabled', 'true');
        this.runButton.removeAttribute('disabled');
    }
    setIdleStatus(msg, iconName) {
        this.statusIndicator.setStatus(UIIndicatorStatus.Idle, msg, iconName);
        this.stopButton.setAttribute('disabled', 'true');
        this.runButton.removeAttribute('disabled');
    }
    setErrorStatus(msg, iconName) {
        this.statusIndicator.setStatus(UIIndicatorStatus.Error, msg, iconName || 'status-error');
        this.stopButton.setAttribute('disabled', 'true');
        this.runButton.removeAttribute('disabled');
    }
    updateStatus(status) {
        if (status.btnReloadEnable != null) {
            this.updateButtonStatus(this.reloadButton, status.btnReloadEnable);
        }
        if (status.btnOpenJSConsoleEnable != null) {
            this.updateButtonStatus(this.openJSConsoleButton, status.btnOpenJSConsoleEnable);
        }
        if (status.btnStopEnable != null) {
            this.updateButtonStatus(this.stopButton, status.btnStopEnable);
        }
        if (status.btnRunEnable != null) {
            this.updateButtonStatus(this.runButton, status.btnRunEnable);
        }
        if (status.prjSelectorEnable != null) {
            this.runSelector.setEnable(false);
        }
        if (status.progressStatus != null) {
            this.statusIndicator.setStatus(status.progressStatus);
        }
        if (status.progressMsg != null) {
            this.statusIndicator.setText(status.progressMsg, status.progressIcon);
        }
    }
    updateButtonStatus(element, enabled) {
        if (!element) {
            throw new Error("updateButtonStatus fail: element is null");
        }
        if (enabled) {
            element.removeAttribute('disabled');
        }
        else {
            element.setAttribute('disabled', 'true');
        }
    }
}
//# sourceMappingURL=ToolbarView.js.map