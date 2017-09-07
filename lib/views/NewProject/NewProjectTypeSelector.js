'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createLabel, createElement, createControlBlock } from '../../element/index';
import { UIButtonGroup, UIButtonConfig, UIButtonGroupMode } from '../../ui-components/UIButtonGroup';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UISelect } from '../../ui-components/UISelect';
import { DEWBResourceManager } from '../../DEWorkbench/DEWBResourceManager';
class ProjectTypeInfo {
}
export class NewProjectTypeSelector extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        // Project Type Radio
        this.projectTypeButtons = new UIButtonGroup(UIButtonGroupMode.Radio);
        let selectorBlock = createControlBlock('project-type', 'Project Type', this.projectTypeButtons.element());
        this.buttonListener = (evt) => { this.onTypeSelected(evt); };
        // Load project types from resources
        this.projectTypes = DEWBResourceManager.getJSONResource('project_types.json')["projectTypes"];
        for (var i = 0; i < this.projectTypes.length; i++) {
            let projectType = this.projectTypes[i];
            this.projectTypeButtons.addButton(new UIButtonConfig().setId(projectType.name)
                .setCaption(projectType.description)
                .setSelected(i == 0)
                .setClickListener(this.buttonListener));
        }
        // Template selector
        this.projectTemplateSelector = new ProjectTemplateSelector();
        this.mainElement = createElement('div', {
            elements: [
                selectorBlock,
                this.projectTemplateSelector.element()
            ],
            className: 'block'
        });
        //select first type
        this.onTypeSelected(this.projectTypes[0].name);
    }
    getProjectTypeByName(name) {
        for (var i = 0; i < this.projectTypes.length; i++) {
            if (this.projectTypes[i].name === name) {
                return this.projectTypes[i];
            }
        }
        return null;
    }
    onTypeSelected(typeId) {
        let projectType = this.getProjectTypeByName(typeId);
        if (projectType && projectType.templates && projectType.templates.length > 0) {
            this.projectTemplateSelector.setTemplates(projectType.templates);
            this.projectTemplateSelector.show();
        }
        else {
            this.projectTemplateSelector.hide();
        }
    }
    destroy() {
        this.projectTypes.length = 0;
        this.projectTypes = undefined;
        this.projectTypeButtons.destroy();
        this.projectTypeButtons = undefined;
        this.projectTemplateSection = undefined;
        this.projectTemplateSelector.destroy();
        this.projectTemplateSelector = undefined;
        super.destroy();
    }
    getProjectType() {
        return this.projectTypeButtons.getSelectedButtons()[0];
    }
    getTemplateName() {
        return this.projectTemplateSelector.getSelectedTemplate();
    }
}
class ProjectTemplateSelector extends UIBaseComponent {
    constructor() {
        super();
        this.initUI();
    }
    initUI() {
        this.cmbTemplates = new UISelect();
        // Info Label
        let labelInfo = createLabel("In order to create a Ionic project you need to have installed on your computer the Ionic cli utility.To check if it's already installed launch 'ionic help' command into the terminal.");
        labelInfo.classList.add('text-warning');
        let block = createControlBlock('project-template-selector', 'Project Template', this.cmbTemplates.element(), 'settings-view');
        this.mainElement = createElement('div', {
            elements: [
                labelInfo, block
            ]
        });
        this.hide();
    }
    show() {
        this.mainElement.style.display = "initial";
    }
    hide() {
        this.mainElement.style.display = "none";
    }
    destroy() {
        this.cmbTemplates.setItems([]);
        this.cmbTemplates.destroy();
        this.cmbTemplates = undefined;
        super.destroy();
    }
    setTemplates(templates) {
        this.cmbTemplates.setItems([]);
        let items = new Array();
        for (var i = 0; i < templates.length; i++) {
            let item = {
                name: templates[i],
                value: templates[i],
            };
            items.push(item);
        }
        this.cmbTemplates.setItems(items);
    }
    getSelectedTemplate() {
        return this.cmbTemplates.getSelectedItem();
    }
}
//# sourceMappingURL=NewProjectTypeSelector.js.map