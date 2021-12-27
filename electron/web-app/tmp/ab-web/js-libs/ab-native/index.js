jsLibs.exportModule('ab-native', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abNative_Class
{

    get ActionsSetDef() {
        return require('./ActionsSetDef');
    }

    get WebApp() {
        return require('./WebApp');
    }


    constructor()
    {
        this.nativeApp = null;

        this._actionsSets = {};
        this._initialized = false;

        this._actionId_Last = 0;
        this._onResultInfos = {};
    }

    addActionsSet(actionsSetName, actionsSet)
    {
        const 
            NativeActionsSet = require('./NativeActionsSet')
        ;

        js0.args(arguments, 'string', require('./ActionsSetDef'));

        let nativeActionsSet = new NativeActionsSet(actionsSetName, actionsSet);

        this._actionsSets[actionsSetName] = actionsSet;

        return nativeActionsSet;
    }

    // createActionsSet(actionsSetName)
    // {
    //     js0.args(arguments, 'string');

    //     return new NativeActionsSet(name);
    // }

    callNative_Async(actionsSetName, actionName, args = {}, callbackFn = null)
    {
        js0.args(arguments, 'string', 'string', [ js0.RawObject, js0.Default ], [ 'function', 
                js0.Null, js0.Default ]);

        return new Promise((resolve, reject) => {
            try {
                this._callNative(actionsSetName, actionName, args, (result) => {
                    resolve(result);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    callWeb(actionId, actionsSetName, actionName, args)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);

        if (this.nativeApp === null)
            throw new Error('Platform not set.');

        if (!this._initialized)
            throw new Error(`'abNative' has not been initialized.`);

        this.nativeApp.callWeb(actionId, actionsSetName, 
                this.getActionSet(actionsSetName).getWebInfo(actionName), args);
    }

    errorNative(message)
    {
        console.error('Native error:', message);
    }

    getActionInfo(actionsSetName, actionName)
    {
        if (!(actionName in nativeActions.actions_Web))
            throw new Error(`Action '${actionName}' does not exist.`);
    }

    getActionSet(actionsSetName)
    {
        if (!(actionsSetName in this._actionsSets))
            throw new Error(`Actions Set '${actionsSetName}' does not exist.`);

        return this._actionsSets[actionsSetName];
    }

    init(platform)
    {
        js0.args(arguments, js0.Enum([ 'web', 'android', 'ios' ]));

        if (platform === 'web')
            this.nativeApp = new (require('./NativeApp_Web'))();
        else if (platform === 'android')
            this.nativeApp = new (require('./NativeApp_Android'))();
        else if (platform === 'ios')
            this.nativeApp = new (require('./NativeApp_IOS'))();

        this._initialized = true;
        // this.nativeApp.init();
    }

    onNativeResult(actionId, result)
    {
        let actionInfo = this._onResultInfos[actionId].actionInfo;

        let parseResultFn = (result) => {
            if (actionInfo.resultArgs !== null) {
                let errors = [];
                if (!js0.type(result, js0.Preset(actionInfo.resultArgs), errors)) {
                    console.error('Result:', result);
                    console.error(errors);
                    throw new Error(`Wrong action '${actionInfo.name}' result.`);
                }
            }
    
            if (this._onResultInfos[actionId].callbackFn !== null)
                this._onResultInfos[actionId].callbackFn(result);
            delete this._onResultInfos[actionId];
        };

        if (result instanceof Promise) {
            result
                .then((result) => {
                    parseResultFn(result);
                })
                .catch((e) => {
                    console.error('Cannot parse native result promise:');
                    console.error(e);
                });
        } else 
            parseResultFn(result);
    }

    setPlatform(platform)
    {
        js0.args(arguments, js0.Enum([ 'web', 'android', 'ios' ]));

        console.log('Platform set: ' + platform);

        this.init(platform);
    }


    _callNative(actionsSetName, actionName, args = {}, callbackFn = null)
    {
        js0.args(arguments, 'string', 'string', [ js0.RawObject, js0.Default ], [ 'function', 
                js0.Null, js0.Default ]);

        if (this.nativeApp === null)
            throw new Error('Platform not set.');

        if (!this._initialized)
            throw new Error(`'abNative' has not been initialized.`);

        if (!this.getActionSet(actionsSetName).hasNative(actionName)) {
            throw new Error(`Action '${actionName}' does not exist in Actions Set '${actionsSetName}'.`);
        }
        let actionInfo = this.getActionSet(actionsSetName).getNativeInfo(actionName);

        let actionId = ++this._actionId_Last;
        this._onResultInfos[actionId] = {
            actionInfo: actionInfo,
            callbackFn: callbackFn,
        };

        this.nativeApp.callNative(actionId, actionsSetName, actionInfo, args);
    }

}
const abNative = new abNative_Class();



module.exports = abNative;


 });