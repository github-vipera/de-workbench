'use babel';
import * as _ from 'lodash';
export class EventSupport {
    constructor() {
        this._evtListeners = [];
    }
    addEventListener(listener) {
        this._evtListeners.push(listener);
    }
    removeEventListener(listener) {
        _.remove(this._evtListeners, function (ref) {
            return ref == listener;
        });
    }
    removeAllListeners() {
        this._evtListeners = [];
    }
    fireEvent(name, ...data) {
        setTimeout(() => {
            _.forEach(this._evtListeners, (delegateFn) => {
                delegateFn(name, data);
            });
        });
    }
}
//# sourceMappingURL=EventSupport.js.map