jsLibs.exportModule('js0', 'Delay', (require, module, exports) => { 'use strict';

const
    js0 = require('.')
;

class Delay
{

    constructor()
    {
        this._delays = [];
    }

    delay(identification, alias, fn, time)
    {
        js0.args(arguments, null, 'string', 'function');

        let delay = this._getDelay(identification, alias);
        if (delay === null) {
            delay = {
                identificator: identificator,
                alias: alias,
                timeout: null,
            };
        } else
            clearTimeout(delay.timeout);

        delay.timeout = setTimeout(() => {
            fn();
            this._removeDelay(identificator, alias);
        }, time);
    }


    _getDelay(identificator, alias)
    {
        for (let delay of this._delays) {
            if (delay.identificator !== identificator)
                continue;
            if (delay.alias !== alias)
                continue;

            return delay;
        }

        return null;
    }

    _removeDelay(identificator, alias)
    {
        for (let i = 0; i < this._delays.length; i++) {
            let delay = this._delays[i];
            if (delay.identificator !== identificator)
                continue;
            if (delay.alias !== alias)
                continue;

            this._delays.splice(i, 1);
            return;
        }
    }

}
module.exports = Delay;





 });