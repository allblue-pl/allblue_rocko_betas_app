jsLibs.exportModule('ab-text-parser', 'index', (require, module, exports) => { 'use strict';

class abTextParser_Class
{

    constructor()
    {

    }

    parse(text)
    {
        let
            Text = require('./Text')
        ;

        let t = new Text(text);

        return t.parts;
    }

}
module.exports = new abTextParser_Class();





 });