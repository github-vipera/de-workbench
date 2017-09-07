'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement, insertElement } from '../../element/index';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UILoggerComponent } from '../../ui-components/UILoggerComponent';
import { Logger } from '../../logger/Logger';
import { UILineLoader } from '../../ui-components/UILineLoader';
export class NewProjectProgressPanel extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        // Create Logger Overlay
        this.logOverlayElement = createElement('div', {
            className: 'de-workbench-newproj-logger-overlay'
        });
        this.loggerComponent = new UILoggerComponent(false);
        this.loggerComponent.element().classList.add('de-workbench-newproj-logger-component');
        insertElement(this.logOverlayElement, this.loggerComponent.element());
        /*let progressLineContainer = createElement('div',{
          elements: [
            createElement('progress',{
              className: 'de-workbench-newproj-logger-progressline'
            })
          ],
          className: 'de-workbench-newproj-logger-progressline-container'
        })
        insertElement(this.logOverlayElement, progressLineContainer)*/
        let progressInd = new UILineLoader();
        progressInd.setOnLoading(true);
        let progressLineContainer = createElement('div', {
            elements: [
                progressInd.element()
            ],
            className: 'de-workbench-newproj-logger-progressline-container'
        });
        insertElement(this.logOverlayElement, progressLineContainer);
        this.mainElement = this.logOverlayElement;
        //private loggerComponent: UILoggerComponent;
        this.bindWithLogger();
    }
    bindWithLogger() {
        console.log("bindWithLogger");
        Logger.getInstance().addLoggingListener(this);
        Logger.getInstance().debug("LoggerView -> bind with log done");
    }
    onLogging(level, msg) {
        if (this.started) {
            this.loggerComponent.addLog(msg, level);
        }
    }
    destroy() {
        this.loggerComponent.destroy();
        super.destroy();
    }
    show() {
        this.mainElement.style.display = "initial";
    }
    hide() {
        this.mainElement.style.display = "none";
    }
    startLog() {
        this.started = true;
    }
    stopLog() {
        this.started = false;
    }
}
//# sourceMappingURL=NewProjectProgressPanel.js.map