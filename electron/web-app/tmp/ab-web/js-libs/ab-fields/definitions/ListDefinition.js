jsLibs.exportModule('ab-fields', 'definitions/ListDefinition', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    ListField = require('../fields/ListField'),

    Definition = require('./Definition'),
    VarDefinition = require('./VarDefinition')
;

class ListDefinition extends Definition
{

    constructor()
    { super();
        this._itemDefinition = null;
    }

    item(itemDefinitionClass = null)
    {
        js0.args(arguments, [ js0.Default, 'function' ]);

        if (this._itemDefinition === null) {
            if (itemDefinitionClass === null)
                itemDefinitionClass = VarDefinition;
            
            this._itemDefinition = new itemDefinitionClass();
            return this._itemDefinition;
        }

        if (itemDefinitionClass !== null) {
            if (!(this._itemDefinition instanceof itemDefinitionClass)) {
                throw new Error(`List items definition class already declared as 
                        '${this._itemDefinition.constructor.name}'.`);
            }
        }

        return this._itemDefinition;
    }


    /* Definition Overrides */
    create(keys = [], root = null, fieldName = null)
    {
        js0.args(arguments, [ js0.Default, Array ], [ js0.Default, 'object' ], 
                [ js0.Default, 'string' ]);

        let field = new ListField(this, keys);

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
module.exports = ListDefinition;





 });