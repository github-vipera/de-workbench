'use babel';
import { InkProvider } from '../DEWorkbench/DEWBExternalServiceProvider';
export class ConsoleView {
    constructor() {
    }
    show() {
        if (!InkProvider.getInstance().isAvailable()) {
            return;
        }
    }
    hide() {
        if (!InkProvider.getInstance().isAvailable()) {
            return;
        }
    }
    isAvailabe() {
        return InkProvider.getInstance().isAvailable();
    }
}
//# sourceMappingURL=ConsoleView.js.map