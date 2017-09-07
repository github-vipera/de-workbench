'use babel';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/** @jsx etch.dom */
const etch = require("etch");
const $ = etch.dom;
export class FooClass {
    constructor(props, children) {
        // perform custom initialization here...
        // then call `etch.initialize`:
        etch.initialize(this);
    }
    render() {
        return <div></div>;
    }
    // Required: Update the component with new properties and children.
    update(props, children) {
        // perform custom update logic here...
        // then call `etch.update`, which is async and returns a promise
        return etch.update(this);
    }
    // Optional: Destroy the component. Async/await syntax is pretty but optional.
    destroy() {
        return __awaiter(this, void 0, void 0, function* () {
            // call etch.destroy to remove the element and destroy child components
            yield etch.destroy(this);
            // then perform custom teardown logic here...
        });
    }
}
//# sourceMappingURL=FooClass.jsx.map