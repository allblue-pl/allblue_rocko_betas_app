jsLibs.exportModule('spk-messages', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class spkMessages_Class
{

    get Messages() {
        return require('./Messages');
    }


    constructor()
    {
        this._textFn = (text) => {
            return this._texts[text];
        };  
        this._texts = {
            Close: 'Close',
        };
    }

    setTextFn(textFn)
    {
        js0.args(arguments, 'function');

        this._textFn = textFn;
    }

    text(text)
    {
        js0.args(arguments, 'string');

        return this._textFn(text);
    }

}
const spkMessages = new spkMessages_Class();



module.exports = spkMessages;


 });