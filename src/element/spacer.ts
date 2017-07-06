'use babel'
/*!
 * XAtom Debug
 * Copyright(c) 2017 Williams Medina <williams.medinaa@gmail.com>
 * MIT Licensed
 */

import { insertElement, createElement } from './element'

export function createButtonSpacer (options?, elements?) {
  let el = createElement('span', {
    className: `btn-spacer`,
    elements: elements || options,
    options
  });
  el.style.paddingLeft = "5px"
  el.style.paddingRight = "5px"
  return el
}
