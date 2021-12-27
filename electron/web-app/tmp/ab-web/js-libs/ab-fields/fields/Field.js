jsLibs.exportModule('ab-fields', 'fields/Field', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Definition = require('../definitions/Definition')
;

class Field
{

    get $value() { js0.virtual(this); }
    set $value(value) { js0.virtual(this); }


    constructor(definition, keys)
    {
        js0.args(arguments, Definition, Array);

        this.__definition = definition;
        this.__keys = keys;
    }

}
module.exports = Field;





 });