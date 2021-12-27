jsLibs.exportModule('ab-nodes', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abNodes_Class
{

    get HideNode() {
        return require('./nodes/HideNode');
    }

    get Node() {
        return require('./Node');
    }

    get RepeatNode() {
        return require('./nodes/RepeatNode');
    }

    get RootNode() {
        return require('./nodes/RootNode');
    }

    get ShowNode() {
        return require('./nodes/ShowNode');
    }

    get SingleNode() {
        return require('./nodes/SingleNode');
    }

    get TextNode() {
        return require('./nodes/TextNode');
    }


    get debug() {
        return this._debug;
    }
    

    constructor() {
        this._debug = false;
    }

    setDebug(debug)
    {
        js0.args(arguments, 'boolean');

        this._debug = debug;
    }

};
module.exports = new abNodes_Class();






 });