'use babel';
import { createElement } from '../../../element/index';
import { UIStackedView } from '../../../ui-components/UIStackedView';
import { UIBaseComponent } from '../../../ui-components/UIComponent';
import { ProjectManager } from '../../../DEWorkbench/ProjectManager';
import { VariantsEditorCtrl } from './VariantsEditorCtrl';
export class VariantsView extends UIBaseComponent {
    constructor() {
        super();
        this.buildUI();
    }
    buildUI() {
        this.currentProjectRoot = ProjectManager.getInstance().getCurrentProjectPath();
        this.variantsEditorCtrl = new VariantsEditorCtrl(this.currentProjectRoot);
        let mainContainer = createElement('div', {
            elements: [this.variantsEditorCtrl.element()]
        });
        mainContainer.style.height = "80%";
        this.stackedPage = new UIStackedView({
            titleIconClass: 'icon-versions'
        })
            .setTitle('Build Variants')
            .setInnerView(mainContainer);
        this.mainElement = this.stackedPage.element();
    }
}
//# sourceMappingURL=VariantsView.js.map