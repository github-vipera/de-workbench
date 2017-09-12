'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createText, createElement } from '../element/index';
import { UIBaseComponent } from '../ui-components/UIComponent';
export class MonitorView extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
        //this.monitoring = appmetrics.monitor();
        /*
        this.monitoring.on('initialized', function (env) {
            env = this.monitoring.getEnvironment();
            for (var entry in env) {
                console.log(entry + ':' + env[entry]);
            };
        });
    
        this.monitoring.on('cpu', (cpu)=> {
            console.log('[' + new Date(cpu.time) + '] CPU: ' + cpu.process);
            this.cpuText.innerText = cpu.process
        });
        **/
    }
    initUI() {
        this.cpuText = createElement('span', {
            elements: [createText("CPU:")]
        });
        this.mainElement = createElement('div', {
            elements: [
                this.cpuText
            ]
        });
    }
}
//# sourceMappingURL=MonitorView.js.map