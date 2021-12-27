jsLibs.exportModule('ab-native', 'WebApp.ActionsSet', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

'use strict';

class ActionsSet
{

    constructor(webApp)
    {
        js0.args(arguments, require('./WebApp'));

        this.webApp = webApp;

        this._actions_Native = {};
    }

    addNative(actionName, fn)
    {
        js0.args(arguments, 'string', 'function');

        this._actions_Native[actionName] = {
            fn: fn,
        };
    }

    callWeb(actionsSetName, actionName, args, callbackFn)
    {
        js0.args(arguments, 'string', js0.RawObject, callbackFn);

        this.webApp.callWeb(actionsSetName, actionName, args, callbackFn);
    }

    hasNative(actionName)
    {
        return actionName in this._actions_Native;
    }

    getNativeInfo(actionName)
    {
        if (!(actionName in this._actions_Native))
            abNative.errorNative(`Action '${actionName}' does not exist.`);

        return this._actions_Native[actionName];
    }

}

module.exports = ActionsSet;
exports = module.exports;




 });