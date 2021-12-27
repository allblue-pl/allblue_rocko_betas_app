jsLibs.exportModule('js0', 'index', (require, module, exports) => { 'use strict';


class js0_Class
{

    get List() {
        return require('./List');
    }

    get TimeSpan() {
        return require('./TimeSpan');
    }


    constructor()
    {
        
    }

    args(args, ...types)
    {
        for (let i = 0; i < types.length; i++) {
            let errors = [];
            if (!this.type(args[i], types[i], errors)) {
                console.error(`Error: Argument ${i} -> `, errors);
                throw new this.TypeError('Wrong argument type.');
            }
        }
    }

    argsC(args, ...types)
    {
        for (let i = 0; i < types.length; i++) {
            if (!this.type(args[i], types[i]))
                return false;
        }

        return true;
    }

    assert(value, message = '')
    {
        if (!value)
            throw new this.AssertionError(message);
    }

    copyArray(arr)
    {
        this.args(arguments, Array);

        let valueTypes = [
            'undefined',
            'boolean',
            'number',
            'string',
        ];

        let arr_New = new Array();
        for (let val of arr) {
            // if (this.type(val, valueTypes)) {
            //     arr_New.push(val);
            //     continue;
            // }

            if (this.type(val, js0.Null)) {
                arr.push(null);
                continue;
            }

            if (this.type(val, this.RawObject)) {
                arr_New.push(this.copyObject(val));
                continue;
            }

            if (this.type(val, Array)) {
                arr_New.push(this.copyArray(val));
                continue;
            }

            arr_New.push(val);
        }

        return arr_New;
    }

    copyObject(obj)
    {
        this.args(arguments, js0.RawObject);

        let valueTypes = [
            'undefined',
            'boolean',
            'number',
            'string',
        ];

        let obj_New = {};
        for (let prop in obj) {
            // if (this.type(obj[prop], valueTypes)) {
            //     obj_New[prop] = obj;
            //     continue;
            // }
            if (this.type(obj[prop], js0.Null)) {
                obj_New[prop] = null;
                continue;
            }

            if (this.type(obj[prop], this.RawObject)) {
                obj_New[prop] = this.copyObject(obj[prop]);
                continue;
            }

            if (this.type(obj[prop], Array)) {
                obj_New[prop] = this.copyArray(obj[prop]);
                continue;
            }

            obj_New[prop] = obj[prop];
        }

        return obj_New;
    }

    // implement(mainObject, propClass, ...propArgs)
    // {
    //     this.prop(mainObject, propClass, ...propArgs);
    // }

    // implements(object, propClass)
    // {
    //     return this.type(object, this.Prop(propClass));
    // }

    prop(mainObject, propClass, ...propArgs)
    {
        this.args(arguments, 'object', 'function');

        if (!('Property' in propClass)) {
            throw new Error(`\`${propClass}\` is not a \`Property\` ` +
                    `(no \`Property\` in object prototype).`);
        }
        if (typeof propClass.Property !== 'string') {
            throw new Error(`\`${propClass}\` is not a \`Property\` ` +
                    `(\`Property\` is not a string).`);
        }

        propArgs.splice(0, 0, null);
        let prop = new (Function.prototype.bind.apply(propClass, propArgs))();
        Object.defineProperty(mainObject, propClass.Property, {
            get: () => { return prop; },
        });
    }

    implements(mainObject, ...interfaceClasses)
    {

    }

    rtn(valueType, value = this.NotSet)
    {
        if (value === this.NotSet) {
            return (value) => {
                this.typeE(value, valueType);
                return value;
            };
        }

        this.typeE(value, valueType);
        return value;
    }

    type(value, valueType, errors = [])
    {
        if (valueType === null)
            return true;

        let typeofValue = typeof value;

        /* Special Types */
        if (valueType === this.ArrayItems) {
            if (value === null || typeof value !== 'object') {                
                errors.push(`\`${value}\` is not an instance \`Array\`.`);
                return false;
            }

            if (!(value instanceof Array)) {
                errors.push(`\`${value}\` is not an instance of \`Array\`.`);
                return false;
            }

            return true;
        } else if (valueType === this.Default) {
            if (value === undefined)
                return true;

            return false;
        } else if (valueType === this.Int) {
            return this.type(value, 'int', errors);
        } else if (valueType === this.Iterable) {
            if (value === null || typeof value !== 'object') {                
                errors.push(`\`${value}\` is not \`Iterable\`.`);
                return false;
            }

            if (typeof value[Symbol.iterator] !== 'function') {
                errors.push(`\`${value}\` is not \`Iterable\`.`);
                return false;
            }

            return true;
        } else if (valueType === this.Long) {
            return this.type(value, 'bigint', errors);
        } else if (valueType === this.Object) {
            return this.type(value, 'object', errors);
        } else if (valueType === this.RawObject) {
            if (value === null)
                return true;

            if (typeofValue === 'undefined') {
                errors.push(`'${value}' is not an RawObject.`);
                return false;
            }

            // if (!(typeof value !== 'object')) {
            //     console.log(typeof value);
            //     errors.push(`'${value}' is not an RawObject.`);
            //     return false;
            // }

            if (Object.getPrototypeOf(value) !== Object.prototype) {
                errors.push(`'${value}' is not an RawObject.`);
                return false;
            }

            return true;
        } else if (valueType === this.NotNull) {
            if (value === null) {
                errors.push(`\`${value}\` cannot be \`null\`.`);
                return false;
            }

            return true;
        } else if (valueType === this.Null) {
            if (value === null)
                return true;

            return false;
        } else if (valueType instanceof this.ArrayItems_Type) {
            if (!this.type(value, Array)) {
                errors.push(`Value must be an instance of Array. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            let i = 0;
            for (let itemValue of value) {
                let itemErrors = [];
                if (!this.type(itemValue, valueType.itemType, itemErrors)) {
                    let itemKey = value.keys()[i];
                    valid = false;
                    errors.push(`Item '${i}' errors: ` + itemErrors.join(', '));
                }
                i++;
            }

            return valid;
        } else if (valueType instanceof this.Enum_Type) {
            for (let value_Enum of valueType.values) {
                if (value === value_Enum)
                    return true;
            }

            errors.push(`Enum value '${value}' not found in '` + 
                    valueType.values.join(', ') + `'.`);
            return false;
        } else if (valueType instanceof this.Default_Type) {
            return false;
        } else if (valueType instanceof this.Iterable_Type) {
            if (!this.type(value, this.Iterable)) {
                errors.push(`Preset must be Iterable. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            let i = 0;
            for (let itemValue of value) {
                let itemErrors = [];
                if (!this.type(itemValue, valueType.itemType, itemErrors)) {
                    let itemKey = value.keys()[i];
                    valid = false;
                    errors.push(`Item '${i}' errors: ` + itemErrors.join(', '));
                }
                i++;
            }

            return valid;
        } else if (valueType instanceof this.Preset_Type) {
            if (typeofValue === 'undefined' && typeof 
                    valueType.defaultValue !== 'undefined') {
                value = valueType.defaultValue;
                typeofValue = typeof value;
            }

            if (value === null) {
                errors.push(`Preset cannot be null.`);
                return false;
            }

            if (typeofValue !== 'object') {
                errors.push(`Preset must be an object. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;

            for (let key in value) {
                if (!(key in valueType.presets)) {
                    errors.push(`Unknown key \`${key}\`.`);
                    valid = false;
                }
            }

            for (let key in valueType.presets) {
                let newErrors = [];
                
                if (typeof value[key] === 'undefined') {
                    if (valueType.presets[key] instanceof Array) {
                        for (let propValueType of valueType.presets[key]) {
                            if (propValueType instanceof this.Default_Type)
                                value[key] = propValueType.defaultValue;
                        }
                    }
                } 

                if (this.type(value[key], valueType.presets[key], newErrors))
                    continue;

                for (let newError of newErrors)
                    errors.push(`${key} -> ${newError}`);

                valid = false;
            }

            // console.log('WTF', value, valid, errors);

            return valid;
        } else if (valueType instanceof this.PresetArray_Type) {
            if (typeofValue === 'undefined' && typeof 
                    valueType.defaultValue !== 'undefined') {
                value = valueType.defaultValue;
                typeofValue = typeof value;
            }

            if (value === null) {
                errors.push(`Preset cannot be null.`);
                return false;
            }

            if (!(value instanceof Array)) {
                errors.push(`PresetArray must be an array. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            
            if (value.length !== valueType.presets.length) {
                errors.push(`Wrong PresetArray length. Required: '${valueType.presets.length}'.`);
                    valid = false;
            }

            for (let i = 0; i < valueType.presets.length; i++) {
                let newErrors = [];
                
                if (typeof value[i] === 'undefined') {
                    if (valueType.presets[i] instanceof Array) {
                        for (let propValueType of valueType.presets[i]) {
                            if (propValueType instanceof this.Default_Type)
                                value[i] = propValueType.defaultValue;
                        }
                    }
                } 

                if (this.type(value[i], valueType.presets[i], newErrors))
                    continue;

                for (let newError of newErrors)
                    errors.push(`${i} -> ${newError}`);

                valid = false;
            }

            return valid;
        } else if (valueType instanceof this.Prop_Type) {
            let propClass = valueType._propClass;
            if (typeof value !== 'object') {
                errors.push(`\`${value}\` does not implement \`${propClass}\` ` +
                        ` (not an object).`);
                return false;
            }

            if (!(propClass.Property in value)) {
                errors.push(`\`${value}\` does not implement \`${propClass}\` ` +
                        ` (property not in object).`);
                return false;
            }

            if (!(value[propClass.Property] instanceof propClass)) {
                errors.push(`\`${value}\` does not implement \`${propClass}\`. ` +
                        ` (wrong property type).`);
                return false;
            }

            return true;
        } else if (valueType === this.PropClass) {
            if (typeof value !== 'function') {
                errors.push(`\`${value}\` is not a \`Property\`.`);
                return false;
            }

            if (!('Property' in value)) {
                errors.push(`\`${value}\` is not a \`Property\`.`);
                return false;
            }

            return true;
        } else if (valueType instanceof this.Object_Type) {
            if (!this.type(value, this.Object)) {
                errors.push(`Preset must be an Object. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            for (let itemKey in value) {
                let itemErrors = [];
                if (!this.type(value[itemKey], valueType.itemType, itemErrors)) {
                    valid = false;
                    errors.push(`Item '${itemKey}' errors: ` + itemErrors.join(', '));
                }
            }

            return valid;
        } else if (valueType instanceof this.RawObject_Type) {
            if (!this.type(value, this.RawObject)) {
                errors.push(`Preset must be a RawObject. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            for (let itemKey in value) {
                let itemErrors = [];
                if (!this.type(value[itemKey], valueType.itemType, itemErrors)) {
                    valid = false;
                    errors.push(`Item '${itemKey}' errors: ` + itemErrors.join(', '));
                }
            }

            return valid;
        }
        /* / Special Types */

        let typeofValueType = typeof valueType;

        /* Basic Types */
        if (typeofValueType === 'string') {
            let result = true;
            if (this.Types_Basic.has(valueType)) {
                result = typeof value === valueType;
            } else if (this.Types_Extended.has(valueType)) {
                switch(valueType) {
                    case 'bool':
                        result = typeofValueType === 'boolean';
                    case 'int':
                        result = Number.isInteger(value);
                        break;
                    case 'finite':
                        result = Number.isFinite(value);
                        break;
                    case 'nan':
                        result = Number.isNaN(value);
                        break;
                }
            } else {
                errors.push(`Unknown type '${valueType}'.`);
                return false;
            }

            if (!result) {
                let typeof_value = typeof value;
                let value_Str = String(value);
                errors.push(`Variable \`${value_Str}\` of type \`${typeof_value}\`` +
                    ` should be of type \`${valueType}\`.`);
                return false;
            }

            return true;
        }

        if (typeofValueType === 'object') {
            /* Multiple Types */
            if (valueType instanceof Array) {
                if (value === null) {
                    for (let i = 0; i < valueType.length; i++) {
                        if (valueType[i] === this.NotNull) {
                            errors.push(`\`${value}\` cannot be \`null\`.`);
                            return false;
                        }
                    }
                }

                for (let i = 0; i < valueType.length; i++) {
                    if (this.type(value, valueType[i], errors))
                        return true;
                }

                return false;
            }

            return true;
        }

        if (typeofValueType === 'function') {
            // /* Property */
            // if ('Property' in valueType) {
            //     if (!this.implements(value, valueType)) {
            //
            //         errors.push(`Variable does not implement property
            //                 \`${valueType.constructor}\`.`);
            //         return false;
            //     }
            //
            //     return true;
            // }

            /* Class */
            if (!(value instanceof valueType)) {
                errors.push(`Variable \`${value}\` is not  an instance of` +
                        ` \`${valueType.name}\`.`);
                return false;
            }

            return true;
        }

        throw new Error(`Unknown \`valueType\`: ${typeofValueType}`);
    }

    typeE(value, valueType)
    {
        let errors = [];
        if (this.type(value, valueType, errors))
            return;

        console.error('Error:', errors);
        throw new this.TypeError('Wrong variable type.');
    }

    virtual(object = null)
    {
        if (object === null)
            throw new this.NotImplementedError();

        throw new this.NotImplementedError(`Method not implemented in:` +
                ` \`${object.constructor.name}\`.`);
    }

}
const js0 = js0_Class.prototype;

Object.defineProperties(js0_Class.prototype, {

    /* Errors */
    AssertionError: { value:
    class js0_AssertionError extends Error
    {
        constructor(...args)
        {
            super(...args);
        }

    }},

    NotImplementedError: { value:
    class js0_NotImplementedError extends Error
    {

        constructor(...args)
        {
            super(...args);
        }

    }},


    TypeError: { value:
    class js0_TypeError extends Error
    {

        constructor(...args)
        {
            super(...args);

            // let stack = this.stack;
            // let stack_array = stack.split('\n');
            // stack_array.splice(1, 3);
            // this.stack = stack_array.join('\n');
        }

    }},
    /* / Errors */

    /* Types */
    Types_Basic: { value:
    new Set([
        'undefined',
        // 'object', /* null */
        'boolean',
        'number',
        'string',
        'symbol',
        'function',
        'object'
    ])},

    Types_Extended: { value:
    new Set([
        'bigint',
        'bool',
        'finite',
        'int',
        'nan'
    ])},

    /* Types Special */
    ArrayItems: { value: (itemType) => {
        return new js0.ArrayItems_Type(itemType);
    }},
    Default: { value: (defaultValue) => {
        return new js0.Default_Type(defaultValue);
    }},
    Enum: { value: (values) => {
        return new js0.Enum_Type(values);
    }},
    Int: { value: Symbol('js0_Int'), },
    Iterable: { value: (itemType) => {
        return new js0.Iterable_Type(itemType);
    }},
    Long: { value: Symbol('js0_Long'), },
    NotNull: { value: Symbol('js0_NotNull'), },
    NotSet: { value: Symbol('js0_NotSet'), },
    Null: { value: Symbol('js0_Null'), },
    Preset: { value: (presets, defaultValue = undefined) => {
        return new js0.Preset_Type(presets, defaultValue);
    }},
    PresetArray: { value: (presets, defaultValue = undefined) => {
        return new js0.PresetArray_Type(presets, defaultValue);
    }},
    Prop: { value: (property) => {
        return new js0.Prop_Type(property);
    }},
    PropClass: { value: Symbol('js0_PropClass'), },
    Object: { value: Symbol('js0_Object'), },
    RawObject: { value: Symbol('js0_RawObject'), },

    And_Type: { value:
    class js0_And_Type 
    {
        constructor(valueTypes)
        {
            js0.args(arguments, js0.PropClass);

            Object.defineProperties(this, {
                _valueTypes: { value: valueTypes, },
            });
        }

    }},

    ArrayItems_Type: { value:
    class js0_ArrayItems_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},

    Default_Type: { value:
    class js0_Default_Type {

        constructor(defaultValue = undefined)
        {
            this.defaultValue = defaultValue;
        }

    }},

    Enum_Type: { value:
        class js0_Enum_Type {
    
            constructor(values = [])
            {
                if (!(values instanceof Array))
                    throw new Error(`'js0.Enum' values must be an Array.`);

                this.values = values;
            }
    
        }},

    Iterable_Type: { value:
    class js0_Iterable_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},

    // Or_Type: { value:
    // class js0_Or_Type
    // {
    //     constructor(propClass)
    //     {
    //         js0.argsE(arguments, js0.PropClass);
    //
    //         Object.defineProperties(this, {
    //             _propClass: { value: propClass, },
    //         });
    //     }
    // }},

    Preset_Type: { value:
    class js0_Preset_Type {
        
        constructor(presets, defaultValue = undefined)
        {
            js0.args(arguments, [ 'object' ], [ 'object', null ]);

            this.presets = presets;
            this.defaultValue = defaultValue;
        }

    }},

    PresetArray_Type: { value:
    class js0_PresetArray_Type {
        
        constructor(presets)
        {
            js0.args(arguments, Array);

            this.presets = presets;
        }

    }},

    Prop_Type: { value:
    class js0_Prop_Type {

        constructor(propClass)
        {
            js0.args(arguments, js0.PropClass);

            Object.defineProperties(this, {
                _propClass: { value: propClass, },
            });
        }

    }},

    Object_Type: { value:
    class js0_Object_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},

    RawObject_Type: { value:
    class js0_RawObject_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},
    /* / Types */

});


module.exports = new js0_Class();






 });