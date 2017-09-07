'use babel';
/*!
 * XAtom Debug
 * Copyright(c) 2017 Williams Medina <williams.medinaa@gmail.com>
 * MIT Licensed
 */
export function createIcon(name) {
    let icon = document.createElement('i');
    icon.className = `dewb-icon dewb-icon-${name}`;
    icon.innerHTML = '&nbsp;';
    return icon;
}
export function createIconFromPath(path) {
    let icon = document.createElement('i');
    icon.className = `dewb-icon`;
    icon.style.backgroundImage = `url(${path})`;
    return icon;
}
//# sourceMappingURL=icon.js.map