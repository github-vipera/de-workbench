'use babel';
export function attachEventFromObject(instance, names, options) {
    names.forEach((listenerName) => {
        if (options[listenerName] && typeof options[listenerName] === 'function') {
            instance.on(listenerName, options[listenerName]);
        }
    });
}
//# sourceMappingURL=events.js.map