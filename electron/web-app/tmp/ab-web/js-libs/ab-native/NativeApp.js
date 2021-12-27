jsLibs.exportModule('ab-native', 'NativeApp', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class NativeApp
{

    constructor()
    {
        
    }

    callNative(actionId, actionsSetName, actionInfo, args)
    {
        js0.args(arguments, 'int', 'string', js0.RawObject, js0.RawObject, 
                [ 'function', js0.Null, js0.Default ]);

        let errors = [];
        if (!js0.type(args, js0.Preset(actionInfo.actionArgs), errors)) {
            console.error(errors);
            throw new Error(`Wrong action '${actionInfo.name}' args.`);
        }
        
        this.__callNative(actionId, actionsSetName, actionInfo.name, args);
    }

    callWeb(actionId, actionsSetsName, actionInfo, args)
    {
        js0.args(arguments, 'int', 'string', js0.RawObject, js0.RawObject);

        let errors = [];
        if (!js0.type(args, js0.Preset(actionInfo.actionArgs), errors)) {
            console.error(errors);
            throw new Error(`Wrong action '${actionInfo.name}' args.`);
        }

        let fnResult = actionInfo.fn(args);
        if (js0.type(fnResult, Promise)) {
            fnResult
                .then((result) => {
                    this._callWeb_ParseResult(actionId, result);
                })
                .catch((err) => {
                    throw err;
                });
        } else {
            this._callWeb_ParseResult(actionId, fnResult);
        }

        this.__onWebResult(actionId, result);
    }
    
    _callWeb_ParseResult(actionId, actionInfo, result)
    {
        if (actionInfo.resultArgs === null) {
            if (!js0.type(result, js0.Null))
                throw new Error(`Wrong action '${actionInfo.name}' result. Expected: null.`);
        } else if (!js0.type(result, js0.Preset(actionInfo.resultArgs))) {
            console.error(errors);
            throw new Error(`Wrong action '${actionInfo.name}' result. Expected: ` + 
                    actionInfo.resultArgs);
        }

        this.__onWebResult(actionId, result);
    }

    _getNextActionId()
    {
        return ++this.actionId_Last;
    }


    __callNative(actionsSetName, actionName, args, callbackFn = null)
    {
        js0.args(arguments, 'string', 'string', js0.RawObject, 'function');
        js0.virtual(this);
    }

    __onWebResult()
    {
        js0.virtual(this);
    }

}

module.exports = NativeApp;
exports = module.exports;




 });