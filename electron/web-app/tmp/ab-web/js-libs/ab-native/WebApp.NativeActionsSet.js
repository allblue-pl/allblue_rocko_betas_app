jsLibs.exportModule('ab-native', 'WebApp.NativeActionsSet', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class NativeActionsSet
{

    constructor(actionsSetName, actionsSet)
    {
        js0.args(arguments, 'string', require('./WebApp.ActionsSet'));

        this.name = actionsSetName;
        this.actionsSet = actionsSet;
    }

    callWeb(actionName, args, callbackFn)
    {
        js0.args(arguments, 'string', js0.RawObject, callbackFn);

        this.webApp.callWeb(this.name, actionName, args, callbackFn);
    }

    callWeb_Async(actionName, args)
    {
        js0.args(arguments, 'string', js0.RawObject);

        return new Promise((resolve, reject) => {
            try {
                this.webApp.callWeb(this.name, actionName, args, (result) => {
                    resolve(result);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

}

module.exports = NativeActionsSet;
exports = module.exports;




 });