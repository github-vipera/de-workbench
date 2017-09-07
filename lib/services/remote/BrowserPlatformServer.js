'use babel';
import { PlatformServerImpl } from './PlatformServer';
export class BrowserPlatformServer extends PlatformServerImpl {
    constructor() {
        super();
    }
    initExpressStaticServe() {
        //NOP: in browser platform assets are already published from embedded server
    }
}
//# sourceMappingURL=BrowserPlatformServer.js.map