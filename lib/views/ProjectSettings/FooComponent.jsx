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
const _ = require("lodash");
const $ = require('JQuery');
const etch = require('etch');
export class FooComponent {
    // Required: Define an ordinary constructor to initialize your component.
    constructor(props, children) {
        alert(etch);
        // perform custom initialization here...
        // then call `etch.initialize`:
        etch.initialize(this);
    }
    // Required: The `render` method returns a virtual DOM tree representing the
    // current state of the component. Etch will call `render` to build and update
    // the component's associated DOM element. Babel is instructed to call the
    // `etch.dom` helper in compiled JSX expressions by the `@jsx` pragma above.
    render() {
        return <div>Hello World!</div>;
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
//# sourceMappingURL=FooComponent.jsx.map