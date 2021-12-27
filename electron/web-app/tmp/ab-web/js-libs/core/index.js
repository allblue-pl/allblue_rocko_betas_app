jsLibs.exportModule('core', 'index', (require, module, exports) => { 'use strict';

const 
    abDate = require('ab-date'),
    abNative = require('ab-native'),
    abResourcePreloader = require('ab-resource-preloader'),
    abText = require('ab-text'),
    js0 = require('js0'),
    spocky = require('spocky'),
    webABApi = require('web-ab-api'),

    // langs = require('./langs'),
    // pickardo = require('./pickardo'),

    $layouts = require('./$layouts')
;


class core_Class 
{

    get base() {
        return this._base;
    }

    get spk() {
        return this._spk;
    }


    constructor()
    {
        this._spk = new spocky.App()
            .config(($app, $cfg) => {
                $cfg
                    .container('app', require('./Main'));
            });

    }

    init(debug)
    {
        /* Spocky */
        spocky.setDebug(debug);
        webABApi.setDebug(debug);

        this._spk.init(debug);
    }

}
const app = new core_Class();



module.exports = app;


 });