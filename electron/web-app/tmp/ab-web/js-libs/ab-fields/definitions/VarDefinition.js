jsLibs.exportModule('ab-fields', 'definitions/VarDefinition', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    VarField = require('../fields/VarField'),

    Definition = require('./Definition')
;

class VarDefinition extends Definition
{

    constructor()
    { super();

    }

    /* Definition Overrides */
    create(keys = [], root = null, fieldName = null)
    {
        js0.args(arguments, [ js0.Default, Array ], [ js0.Default, 'object' ], 
                [ js0.Default, 'string' ]);

        let field = new VarField(this, keys);

        if (root !== null && fieldName !== null) {
            Object.defineProperty(root, fieldName, {
                get: () => {
                    return field.$value;
                },
                set: (value) => {
                    field.$value = value;
                },
                enumerable: true,
            });
        }

        return field;
    }
    /* / Definition Overrides */

}
module.exports = VarDefinition;





 });