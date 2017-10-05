'use babel';
import { createElement } from './element';
export function createButtonSpacer(options, elements) {
    let el = createElement('span', {
        className: `btn-spacer`,
        elements: elements || options,
        options
    });
    el.style.paddingLeft = "5px";
    el.style.paddingRight = "5px";
    return el;
}
//# sourceMappingURL=spacer.js.map