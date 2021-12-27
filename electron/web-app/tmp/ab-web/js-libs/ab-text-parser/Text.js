jsLibs.exportModule('ab-text-parser', 'Text', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    TextParser = require('./parsers/TextParser')
;

class Text
{

    constructor(content)
    {
        this.content = content;
        this.parsers = [
            new TextParser(this),
        ];

        this.parts = [];

        if (content !== '')
            this.parse();
    }

    addPart(part)
    {
        js0.args(arguments, 'string');

        this.parts.push(part);
    }

    error(message, line)
    {
        throw new Error('Line: ' + line + '. ' + message);
    }

    finishParser(parser)
    {
        js0.args(arguments, require('./Parser'));

        this.parsers.pop();
    }

    parse()
    {
        let i = 0;
        let line = 1;
        while(true) {
            let c = this.content[i];
            let step = 0;

            let activeParser = this.parsers[this.parsers.length - 1];
            step = activeParser.read(c, i, line);
            
            if (step === 0 && this.parsers[this.parsers.length - 1] === activeParser)
                throw new Error(`Parser '${activeParser.constructor.name}' with step 0 created infinite loop.`);

            i += step;
            if (c === '\n')
                line++;

            if (i >= this.content.length)
                break;
        }

        // if (this.parts.length > 1)
        //     throw new Error(`Part '${this.parts[this.elems.length - 1].name}' not closed.`);
    }

    startParser(parser)
    {
        js0.args(arguments, require('./Parser'));

        this.parsers.push(parser);
    }

}
module.exports = Text;





 });