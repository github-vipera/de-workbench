'use babel';
import { InkProvider } from '../DEWorkbench/DEWBExternalServiceProvider';
export class ConsoleView {
    constructor() {
    }
    show() {
        if (!InkProvider.getInstance().isAvailable()) {
            return; //TODO!! show a wraning
        }
    }
    hide() {
        if (!InkProvider.getInstance().isAvailable()) {
            return; //TODO!! show a wraning
        }
        //this.cons.hide()
    }
    isAvailabe() {
        return InkProvider.getInstance().isAvailable();
    }
}
//# sourceMappingURL=ConsoleView.js.map