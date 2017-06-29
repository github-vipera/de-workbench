'use babel'
/*!
 * XAtom Debug
 * Copyright(c) 2017 Williams Medina <williams.medinaa@gmail.com>
 * MIT Licensed
 */

export function createText (text: string): Text {
  return document.createTextNode(`${text}`);
}

export function insertElement (target: HTMLElement, elements) {
  if (!Array.isArray(elements)) {
    elements = [ elements ]
  }
  elements.forEach((el) => target.appendChild(el));
  return target;
}

export function createElement (tagName, options?) {
  let element = document.createElement(tagName);
  if (options) {
    let extras = options.options || {};
    if (options.className) {
      element.className = options.className;
    }
    if (options.id) {
      element.setAttribute('id', options.id);
    }
    if (extras.tooltip) {
      extras.tooltip['subscriptions'].add(atom['tooltips'].add(element, {
        title: extras.tooltip.title || ''
      }));
    }
    if (extras.className) {
      element.classList.add(extras.className)
    }
    if (extras.click) {
      element.addEventListener('click', (e) => {
        extras.click(e);
      });
    }
    if (extras.change) {
      element.addEventListener('change', (e) => extras.change(e.target.value, e));
    }
    if (extras.disabled) {
      element['disabled'] = extras.disabled;
    }
    if (options.elements) {
      let contents = Array.isArray(options.elements) ? options.elements: [options.elements];
      contents.forEach((content) => insertElement(element, content))
    }
  }
  return element;
}
