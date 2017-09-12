'use babel';
/*!
 * XAtom Debug
 * Copyright(c) 2017 Williams Medina <williams.medinaa@gmail.com>
 * MIT Licensed
 */
import { createElement, createText } from './element';
export function createSelect(options, elements) {
    return createElement('select', {
        elements: elements || options,
        options: elements ? options : null,
        className: "input-select"
    });
}
export function createOption(name, value) {
    let option = createElement('option', {
        elements: [createText(name)]
    });
    option.setAttribute('value', value);
    return option;
}
//# sourceMappingURL=select.js.map