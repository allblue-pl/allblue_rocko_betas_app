jsLibs.exportModule('ab-text-parser', 'parsers/FieldArgsParser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Parser = require('../Parser')
;

class FieldArgsParser extends Parser
{

    static IsStart(c, i, line) {
        return c === '(' ? 1 : 0;
    }


    constructor(text, fieldParser)
    {
        js0.args(arguments, require('../Text'), require('./FieldParser'));
        super(text);

        this.fieldParser = fieldParser;

        this.args = '';
    }

    __read(c, i, line)
    {
        let step;

        if (c === ')') {
            this.fieldParser.args = this.args;
            this.finish();

            if (i + 1 >= this.text.content.length && !this.fieldParser.escaped) {
                if (this.name !== '') {
                    this.fieldParser.finish();
                    this.fieldParser.addField();
                }
            }

            return 1;
        }

        this.args +=c;
        return 1;
    }

}
module.exports = FieldArgsParser;





 });