jsLibs.exportModule('js0', 'List', (require, module, exports) => { 'use strict';

const js0 = require('.');


class List
{

    get size() {
        return this._values.length;
    }


    constructor(iterable = null)
    {
        js0.args(arguments, [ js0.Iterable, js0.Default ]);

        this._keys = [];
        this._values = [];

        if (iterable !== null) {
            for (let item of iterable) {
                if (item instanceof Array) {
                    if (item.length === 2) {
                        this.set(item[0], item[1]);
                        continue;
                    }
                }

                this.add(item);
            }
        }
    }

    [Symbol.iterator]()
    {
        return new List.Iterator(this);
    }

    add(...values)
    {
        let index = 0;
        for (let value of values) {
            while(this._keys.includes(index))
                index++;

            this.set(index, value);
        }
    }

    addAll(values)
    {
        js0.args(arguments, js0.Iterable);

        let index = 0;
        for (let value of values) {
            while(this._keys.includes(index))
                index++;

            this.set(index, value);
        }
    }

    addAt(index, key, value)
    {
        if (index < 0 || index > this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        if (this._values.length === index) {
            this._keys.push(key);
            this._values.push(value);
        } else {
            this._keys.splice(index, 0, key);
            this._values.splice(index, 0, value);
        }

    }

    delete(key)
    {
        let index = this._getIndexE(key);
        this.deleteAt(index);
    }

    deleteAt(index)
    {
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
    }

    get(key)
    {
        let index = this._getIndexE(key);

        return this._values[index];
    }

    getAt(index)
    {
        if (index < 0 || index >= this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        return this._values[index];
    }

    getKeyAt(index)
    {
        if (index < 0 || index >= this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        return this._keys[index];
    }

    getKeys()
    {
        return this._keys.slice();
    }

    getValues()
    {
        return this._values.slice();
    }

    has(key)
    {
        return this._keys.includes(key);
    }

    includes(value)
    {
        return this._values.includes(value);
    }

    indexOf(value)
    {
        return this._values.indexOf(value);
    }

    keys()
    {
        return this._keys.slice();
    }

    remove(value)
    {
        for (let i = this.size - 1; i >= 0; i--) {
            if (this.getAt(i) === value) {
                this.deleteAt(i);
                return;
            }
        }     

        throw new Error(`Value '${value}' does not exist in List.`);
    }

    set(key, value)
    {
        let index = this._keys.indexOf(key);
        if (index === -1)
            index = this._values.length;

        this.setAt(index, key, value);
    }

    setAt(index, key, value)
    {
        if (index < 0 || index > this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        if (index === this._values.length) {
            this._keys.push(key);
            this._values.push(value);
        } else {
            this._keys[index] = key;
            this._values[index] = value;
        }
    }

    slice()
    {

    }

    sort(compareFn)
    {
        let newKeys = this._keys.slice();
        newKeys.sort((aKey, bKey) => {
            return compareFn({ key: aKey, value: this.get(aKey) },
                    { key: bKey, value: this.get(bKey) });
        });

        let newValues = [];
        for (let i = 0; i < this.size; i++)
            newValues.push(this.get(newKeys[i]));

        this._keys = newKeys;
        this._values = newValues;
    }

    values()
    {
        return this._values.slice();
    }


    _getIndexE(key)
    {
        let index = this._keys.indexOf(key);
        if (index === -1)
            throw new Error(`Key \`${key}\` does not exist in \`List\`.`);

        return index;
    }

}
module.exports = List;


Object.defineProperties(List, {

    Iterator: { value:
    class List_Iterator
    {

        constructor(list)
        {
            this._list = list;
            this._iterator = list._keys[Symbol.iterator]();
        }

        next()
        {
            let keyItem = this._iterator.next();

            if (keyItem.done)
                return { value: undefined, done: true, };

            return {
                value: [ keyItem.value, this._list.get(keyItem.value), ],
                done: false,
            };
        }

    }},

});






 });