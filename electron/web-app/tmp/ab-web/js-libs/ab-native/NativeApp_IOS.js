jsLibs.exportModule('ab-native', 'NativeApp_IOS', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    NativeApp = require('./NativeApp')
;

class NativeApp_IOS extends NativeApp
{

    constructor()
    {
        super();
    }


    /* NativeApp */
    __callNative(actionId, actionsSetName, actionName, actionArgs)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);
        
        window.webkit.messageHandlers.abNative_IOS.postMessage({
            messageType: 'callNative',
            actionId: actionId, 
            actionsSetName: actionsSetName, 
            actionName: actionName, 
            actionArgs: actionArgs,
        });
    }

    __onWebResult(actionId, result)
    {
        js0.args(arguments, 'int', [ js0.RawObject, js0.Null ]);

        window.webkit.messageHandlers.abNative_IOS.postMessage({
            messageType: 'onWebResult',
            actionId: actionId,
            result: result,
        });
    }
    /* / NativeApp */

}

module.exports = NativeApp_IOS;
exports = module.exports;




 });