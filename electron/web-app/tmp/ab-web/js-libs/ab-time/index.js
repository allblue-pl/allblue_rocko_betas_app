jsLibs.exportModule('ab-time', 'index', (require, module, exports) => { 'use strict';

const
    abStrings = require('ab-strings'),
    js0 = require('js0')
;

class abTime_Class
{

    constructor()
    {
        
    }

    getParts(time)
    {
        js0.args(arguments, 'number');

        let parts = {};

        parts.h = Math.floor(time / (60 * 60 * 1000));
        time -= parts.h * 60 * 60 * 100;

        parts.m = Math.floor(time / (60 * 1000));
        time -= parts.m * 60 * 1000;

        parts.s = Math.floor(time / 1000);
        time -= parts.s * 1000;

        parts.ts = Math.floor(time / 100);

        return parts;
    }

    getTime()
    {
        return (new Date()).getTime();
    }
    
    // format_HMS(time, properties = {})
    // {
    //     js0.args(arguments, 'number', js0.Preset({
    //         alwaysShow: {
    //             h: [ 'boolean', js0.Default(false) ],
    //             m: [ 'boolean', js0.Default(false) ],
    //             s: [ 'boolean', js0.Default(false) ],
    //         },
    //         usePad: {
    //             h: [ 'boolean', js0.Default(false) ],
    //             m: [ 'boolean', js0.Default(false) ],
    //             s: [ 'boolean', js0.Default(false) ],
    //         },
    //     }))

    //     let time_Str = '';

    //     let h = Math.floor(time / (60 * 60));
    //     if (time_Str !== '' || h !== 0)
    //         time_Str += h + ':';
    //     time -= h * 60 * 60;

    //     let m = Math.floor(time / 60);
    //     if (time_Str !== '' || m !== 0)
    //         time_Str += abStrings.pad(m, '0', 2) + ':';
    //     time -= m * 60;

    //     let s = time;
    //     if (time_Str !== '' || s !== 0)
    //         time_Str += abStrings.pad(s, '0', 2) + ':';
        
    //     return time_Str;
    // }

}
const abTime = new abTime_Class();



module.exports = abTime;


 });