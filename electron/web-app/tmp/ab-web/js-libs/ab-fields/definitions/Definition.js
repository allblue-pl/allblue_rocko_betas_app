jsLibs.exportModule('ab-fields', 'definitions/Definition', (require, module, exports) => { 'use strict'

const
    js0 = require('js0')
;

class Definition
{

    get listeners() {
        return this._listeners;
    }


    constructor()
    {
        this._listeners = [];
    }

    addListener(listener)
    {
        js0.args(arguments, 'object');

        this._listeners.push(listener);
    }


    create(keys = [], root = null, fieldName = null) { js0.virtual(this); }

}
module.exports = Definition;





 });