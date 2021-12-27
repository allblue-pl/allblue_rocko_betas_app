jsLibs.exportModule('ab-cookies', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abCookies_Class
{

    delete(name)
    {

    }

    exists(name)
    {
        return this.getString(name) !== null;
    }

    get(name, defaultValue = undefined)
    {   
        let cookieStr = this.getString(name);
        if (cookieStr === null) {
            if (typeof defaultValue !== undefined)
                return defaultValue;

            throw new Error(`Cookie '${name}' does not exist.`)
        }
        try {
            let cookieJSON = JSON.parse(decodeURIComponent(cookieStr));

            return cookieJSON.value;
        } catch (err) {
            console.error(err);
            throw new Error('AB Cookie not properly formatted.');
        }
    }

    getString(name)
    {
        var cookieName = name + "=";
        var cookieStrsArr = document.cookie.split(';');
        for (let cookieStr of cookieStrsArr) {
            while (cookieStr.charAt(0) === ' ')
                cookieStr = cookieStr.substring(1);
            if (cookieStr.indexOf(name) !== 0)
                continue;

            return cookieStr.substring(name.length + 1, cookieStr.length);
        }

        return null;
    }

    set(name, value, settings = {})
    {
        js0.args(arguments, 'string', null, 
                js0.Preset({
            expires: [ 'number', js0.Null, js0.Default(null), ],
            domain: [ 'string', js0.Null, js0.Default(null), ],
            path: [ 'string', js0.Default('/'), ],
        }, settings));

        let cookieStr = '';
        /* Value */
        cookieStr += name + '=' + encodeURIComponent(JSON.stringify({ value: value })) + '; ';
        /* Path */
        cookieStr += `path=` + settings.path + '; ';
        /* Expires */
        if (settings.expires !== null) {
            let expiresTime = Math.round((new Date()).getTime() / 1000) + settings.expires;
            cookieStr += 'expires=' + (new Date(expiresTime * 1000)).toUTCString() + '; ';
        }
        /* Domain */
        if (settings.domain !== null) {
            cookieStr += 'domain=' + settings.domain + '; ';
        }

        document.cookie = cookieStr;
    }

}
const abCookies = new abCookies_Class();



module.exports = abCookies;


 });