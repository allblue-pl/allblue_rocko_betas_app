jsLibs.exportModule('ab-text', 'index', (require, module, exports) => { 'use strict'

const
    js0 = require('js0')
;

class abText_Class
{

    constructor()
    {
        this._texts = {};
        this._langAlias = null;
    }

    $(text, args = null)
    {
        js0.args(arguments, 'string', [ js0.Null, js0.RawObject, 
                js0.Default ]);

        if (this._langAlias === null) {
            console.warn('Lang alias not set.');
            return this.get(this._langAlias, text, args);
        }

        return this.get(this._langAlias, text, args);
    }

    add(langPrefix, texts)
    {
        js0.args(arguments, 'string', js0.RawObject);

        let langPrefix_Arr = langPrefix.split('.');
        let langAlias = langPrefix_Arr[0];
        let textPrefix_Arr = langPrefix_Arr.slice(1);
        let textPrefix = textPrefix_Arr.join('.');
        if (textPrefix !== '') {
            textPrefix += '.';
        }

        if (!(langAlias in this._texts)) {
            this._texts[langAlias] = {};
        }

        for (let text in texts) {
            this._texts[langAlias][textPrefix + text] = texts[text];
        }

        return this;
    }

    get(langAlias, text, args = null)
    {
        js0.args(arguments, [ js0.Null, 'string' ], 'string', [ js0.Null, 
                js0.RawObject, js0.Default ]);

        let translation = null;

        if (langAlias in this._texts) {
            if (text in this._texts[langAlias])
                translation = this._texts[langAlias][text];
        }

        if (translation === null) {
            if (args === null) {
                return `#${text}#`;
            } else if (Object.keys(args).length === 0) {
                return `#${text}#`;
            } else {
                let args_Arr = [];
                for (let argName in args) {
                    args_Arr.push(`${argName} => ${args[argName]}`);
                }
                return '#' + text + '(' + args_Arr.join(', ') + ')';
            }
        }

        for (let argName in args) {
            translation = translation.replace(new RegExp(`{${argName}}`, 'gm'), 
                    args[argName]);
        }

        return translation;
    }

    setLang(langAlias)
    {
        this._langAlias = langAlias;
    }

}
module.exports = new abText_Class();





 });