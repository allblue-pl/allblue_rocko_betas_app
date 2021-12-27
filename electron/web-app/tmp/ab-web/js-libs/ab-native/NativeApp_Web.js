jsLibs.exportModule('ab-native', 'NativeApp_Web', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    NativeApp = require('./NativeApp')
;

class NativeApp_Web extends NativeApp 
{

    constructor()
    {
        super();
    }

    
    /* NativeApp */
    __callNative(actionId, actionsSetName, actionName, args)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);
        abNative_WebApp.callNative(actionId, actionsSetName, actionName, args);
    }

    // __onWebResult(actionId, result)
    // {
    //     abNative_WebApp.onWebResult(actionId, result);
    // }
    /* / NativeApp */
}

module.exports = NativeApp_Web;
exports = module.exports;




 });