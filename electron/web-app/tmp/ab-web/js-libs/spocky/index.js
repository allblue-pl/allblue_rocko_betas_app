jsLibs.exportModule('spocky', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    abFields = require('ab-fields'),
    abNodes = require('ab-nodes')
;

const App = require('./App');
const Ext = require('./Ext');
const Holder = require('./Holder');
const Layout = require('./Layout');
const Module = require('./Module');
const Viewable = require('./Viewable');


const exts = [];

function ext(spockyExt) {
    js0.args(arguments, Ext);

    Layout.Extensions.push((layoutNode) => {
        spockyExt.onParseLayoutNode(layoutNode);
    });
}


let Debug = false;
function setDebug(debug) {
    exports.Debug = debug;
    abFields.setDebug(debug);
    abNodes.setDebug(debug);
};





module.exports.App = App;
module.exports.Ext = Ext;
module.exports.Holder = Holder;
module.exports.Layout = Layout;
module.exports.Module = Module;
module.exports.Viewable = Viewable;
module.exports.ext = ext;
module.exports.Debug = Debug;
module.exports.setDebug = setDebug;
 });