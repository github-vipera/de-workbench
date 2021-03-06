'use babel';
const { allowUnsafeEval, allowUnsafeNewFunction } = require('loophole');
export class InkProvider {
    constructor() {
    }
    static getInstance() {
        if (!InkProvider.instance) {
            InkProvider.instance = new InkProvider();
        }
        return InkProvider.instance;
    }
    setInk(ink) {
        this._ink = ink;
        this.createConsole();
    }
    getInk() {
        return this._ink;
    }
    isAvailable() {
        return (this._ink != null);
    }
    createConsole() {
        this._cons = InkProvider.getInstance().getInk().Console.fromId('dewb-language-client');
        this._cons.setModes([
            { name: 'DE Workbench Console', default: true, grammar: 'source.javascript' }
        ]);
        let cons = this._cons;
        this._cons.onEval((arg) => {
            var editor;
            editor = arg.editor;
            cons.logInput();
            cons.done();
            try {
                let evaluated = null;
                var docTemplate = allowUnsafeEval(() => allowUnsafeNewFunction(() => evaluated = eval(editor.getText())));
                cons.stdout(evaluated);
                cons.stderr("Errorone!!!");
                return cons.input();
            }
            catch (error) {
                cons.stderr(error);
                return cons.input();
            }
        });
        this._cons.open({
            split: 'down',
            searchAllPanes: false
        });
    }
    getConsole() {
        return this._cons;
    }
}
//# sourceMappingURL=DEWBExternalServiceProvider.js.map