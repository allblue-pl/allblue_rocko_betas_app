jsLibs.exportModule('ab-text-parser', 'Parser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Parser
{

    constructor(text)
    {
        js0.args(arguments, require('./Text'));

        this.text = text;
    }

    error(message, line)
    {
        throw new Error('Line: ' + line + '. ' + message);
    }

    finish()
    {
        this.text.finishParser(this);
    }

    read(c, i, line)
    {
        return this.__read(c, i, line);
    }


    __check(c, i, line) { js0.virtual(this); }
    __read(c, i, line) { js0.virtual(this); }

}
module.exports = Parser;





 });