'use babel';
/*!
 * Dynamic Engine Workbench
 * Copyright(c) 2017 Dynamic Engine Team @ Vipera Plc
 * MIT Licensed
 */
import { createElement } from '../../element/index';
import { UIStackedView } from '../../ui-components/UIStackedView';
import { UIBaseComponent } from '../../ui-components/UIComponent';
import { UITabbedView, UITabbedViewItem } from '../../ui-components/UITabbedView';
import { ProjectManager } from '../../DEWorkbench/ProjectManager';
export class VariantsView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
        // tabbed toolbar
        let addVariantButton = createElement('button', {
            //elements : [ createText("New...")],
            className: 'btn btn-xs icon icon-gist-new'
        });
        atom["tooltips"].add(addVariantButton, { title: 'Create a new Variant' });
        let removeVariantButton = createElement('button', {
            //elements : [ createText("Delete")],
            className: 'btn btn-xs icon icon-dash'
        });
        atom["tooltips"].add(removeVariantButton, { title: 'Remove selected Variant' });
        let renameVariantButton = createElement('button', {
            //elements : [ createText("Rename")],
            className: 'btn btn-xs icon icon-pencil'
        });
        atom["tooltips"].add(renameVariantButton, { title: 'Rename selected Variant' });
        let duplicateVariantButton = createElement('button', {
            className: 'btn btn-xs icon icon-clippy'
        });
        atom["tooltips"].add(duplicateVariantButton, { title: 'Duplicate selected Variant' });
        let tabbedToolbar = createElement('div', {
            elements: [
                createElement('div', {
                    elements: [addVariantButton, removeVariantButton, renameVariantButton, duplicateVariantButton],
                    className: 'btn-group'
                })
            ], className: 'btn-toolbar'
        });
        tabbedToolbar.style.float = "right";
        // end tabbed toolbar
        this.tabbedView = new UITabbedView()
            .setBottomToolbar(tabbedToolbar);
        this.tabbedView.addView(new UITabbedViewItem('Dev', 'Dev', this.createFooElement()));
        this.tabbedView.addView(new UITabbedViewItem('Dev-Local', 'Dev-Local', this.createFooElement()));
        this.tabbedView.addView(new UITabbedViewItem('Test', 'Test', this.createFooElement()));
        this.tabbedView.addView(new UITabbedViewItem('UAT', 'UAT', this.createFooElement()));
        this.tabbedView.addView(new UITabbedViewItem('Production', 'Production', this.createFooElement()));
        let mainContainer = createElement('div', {
            elements: [this.tabbedView.element()]
        });
        //mainContainer.style.border = "solid 1px"
        mainContainer.style.height = "80%";
        this.stackedPage = new UIStackedView()
            .setTitle('Build Variants')
            .setInnerView(mainContainer);
        this.mainElement = this.stackedPage.element();
    }
    createFooElement() {
        return createElement('div', {});
    }
}
//# sourceMappingURL=VariantsView.js.map