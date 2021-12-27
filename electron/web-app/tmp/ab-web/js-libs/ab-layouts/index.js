jsLibs.exportModule('ab-layouts', 'index', (require, module, exports) => { 'use strict';

const LayoutNode = require('./LayoutNode');


class abLayouts_Class
{

    get LayoutNode() {
        return LayoutNode;
    }

    get Parser() {
        return require('./Parser');
    }

}
module.exports = new abLayouts_Class();






 });