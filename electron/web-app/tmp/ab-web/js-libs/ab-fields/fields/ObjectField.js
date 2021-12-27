jsLibs.exportModule('ab-fields', 'fields/ObjectField', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    abFields = require('../.'),
    ObjectDefinition = require('../definitions/ObjectDefinition'),

    Field = require('./Field')
;

class ObjectField extends Field {

    get $value() {
        return this._root;
    }
    set $value(value) {
        js0.args(arguments, js0.RawObject);

        if (value === null) {
            for (let key in this._fields)
                this._fields[key].$value = null;

            return;
        }

        for (let key in value) {
            if (key in this._fields) {
                try {
                    this._fields[key].$value = value[key];
                } catch (err) {
                    console.error('ABFields Stack: ', key);
                    throw err;
                }
            } else if (abFields.Debug)
                console.warn(new Error(`Field '${key}' not defined in Object.`));
        }
    }


    constructor(definition, keys)
    { super(definition, keys);
        js0.args(arguments, ObjectDefinition, Array);

        this._root = {};
        this._fields = {};
        
        for (let fieldName in this.__definition.fields) {
            let fieldDef = this.__definition.fields[fieldName];
            let field = fieldDef.create(keys, this._root, fieldName);
            this._fields[fieldName] = field;
        }
    }   

    $delete(key)
    {
        js0.args(arguments, [ 'number', 'string' ]);

        if (!(key in this._fields))
            throw new Error(`Key '${key}' does not exist.`);

        delete fields[key];

        for (let listener of this._listeners) {
            if ('delete' in listener)
                listener.delete(key, this._parentFields._keys);
            if ('change' in listener)
                listener.change(value, this._parentFields._keys);
        }
    }

    $get(fieldName)
    {
        if (!this.$exists(fieldName))
            throw new Error(`Field '${fieldName}' does not exist in object.`);

        return this._fields[fieldName];
    }

    $exists(fieldName)
    {
        return fieldName in this._fields;
    }

}
module.exports = ObjectField;





 });