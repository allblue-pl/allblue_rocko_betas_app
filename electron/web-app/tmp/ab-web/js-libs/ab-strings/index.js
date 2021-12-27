jsLibs.exportModule('ab-strings', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abStrings_Class
{

    escapeLangChars(string) {
        let replaceFrom = [ 'ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż',
                'Ą', 'Ć', 'Ę', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż' ];
        let replaceTo = [ 'a', 'c', 'e', 'l', 'n', 'o', 's', 'z', 'z',
                'A', 'C', 'E', 'L', 'N', 'O', 'S', 'Z', 'Z' ];
    
        let regexp = new RegExp(replaceFrom.join('|'), 'g');
    
        return string.replace(regexp, (match) => {
            return replaceTo[replaceFrom.indexOf(match)];
        });
    }
    
    escapeToAllowedChars(string, allowedCharacters) {
        let regexp = new RegExp(`[^${allowedCharacters}]`, 'g');

        return string.replace(regexp, '');
    }

    escapeRegExpChars(string)
    {
        return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    getCharsRegExp(types = [], extra = '', langs = null)
    {
        for (let type of types) {
            if (!types.includes(type))
                throw new Error(`Unknown chars type '${type}'.`);
        }

        let chars = '';

        if (types.includes('digits'))
            chars += '0-9';
        if (types.includes('letters'))
            chars += 'a-zA-Z' + this.getLangsSpecialCharacters();
        if (types.includes('special')) {
            chars += ' `!@#%&_=/<>:;",\'' +
                '\\\\' + '\\^' + '\\$' + '\\.' + '\\[' + '\\]' + '\\|' +
                '\\(' + '\\)' + '\\?' + '\\*' + '\\+' + '\\{' + '\\}' +
                '\\-';
        }

        return chars + this.escapeRegExpChars(extra);
    }

    getCharsRegExp_Basic()
    {
        return this.getCharsRegExp([ 'digits', 'letters', 'special' ]);
    }

    getLangsSpecialCharacters(langs = null)
    {
        if (langs === null)
            langs = [ 'pl' ];

        let chars = '';
        if (langs.includes('pl'))
            chars += 'ąćęłńóśźż' + 'ĄĆĘŁŃÓŚŹŻ';

        return chars;
    }

    pad(str, pad, size)
    {
        js0.args(arguments, 'string', 'string', js0.Int);

        str = str + ``;
        while (str.length < size) 
            str = pad + str;
        return str.substr(0, size);
    }
    
    removeDoubles(string, char) {
        let regexp = new RegExp(`${char}${char}`, 'g');
        while (string.match(regexp))
            string = string.replace(regexp, char);

        return string;
    }

}
module.exports = new abStrings_Class();





 });