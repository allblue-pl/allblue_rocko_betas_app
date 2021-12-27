jsLibs.exportModule('ab-text-parser', 'parsers/TextParser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Parser = require('../Parser'),

    ExprParser = require('./ExprParser'),
    FieldParser = require('./FieldParser')
;

class TextParser extends Parser
{

    static IsStart(c, i, line) {
        return c === '<' ? 1 : 0;
    }


    constructor(text)
    {
        js0.args(arguments, require('../Text'));
        super(text);

        this.value = null;
        // this._htmlEntities = new htmlEntities.AllHtmlEntities();
    }

    __read(c, i, line)
    {
        let step;

        // step = TagParser.IsStart(c);
        // if (step > 0) {
        //     if (this.value !== null && this.value !== '') {
        //         while ([ ' ', "\r", "\n" ].includes(this.value[this.value.length - 1]))
        //             this.value = this.value.substring(0, this.value.length - 1);
        //         if (this.value !== '') {
        //             this.text.addNode({
        //                 type: 'text',
        //                 value: this._decodeHtml(this.value),
        //             });
        //         }
        //     }
            
        //     this.finish();
        //     return 0;
        // }

        if (this.value === null) {
            if (c === ' ' || c === "\r" || c === "\n")
                return 1;

            this.value = '';
        }

        step = FieldParser.IsStart(this.text, c, i, line);
        if (step > 0) {
            if (this.value !== null && this.value !== '') {
                this.text.addPart(this.value);
            }
            this.value = '';

            this.text.startParser(new FieldParser(this.text, this));
            return step;
        }

        step = ExprParser.IsStart(this.text.content, i);
        if (step > 0) {
            if (this.value !== null && this.value !== '') {
                this.text.addPart(this.value);
            }
            this.value = '';

            this.text.startParser(new ExprParser(this.text, this));
            return step;
        }

        this.value += c;

        if (i + 1 >= this.text.content.length) {
            this.text.addPart(this.value);
            this.finish();
        }

        return 1;
    }


    _decodeHtml(str)
    {
        // return this._htmlEntities.decode(str);
    }

}
module.exports = TextParser;





 });