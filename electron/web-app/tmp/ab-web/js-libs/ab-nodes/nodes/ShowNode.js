jsLibs.exportModule('ab-nodes', 'nodes/ShowNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const Node = require('../Node');


class ShowNode extends Node
{

    get show() {
        return this._show;
    }
    set show(showValue) {
        js0.args(arguments, 'boolean');

        if (showValue === this._show)
            return;
        this._show = showValue;

        if (!this.active)
            return;

        if (showValue) {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).activate();
            this.refreshDisplayed(true);
        } else {
            this.refreshDisplayed(true);
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).deactivate();
        }
    }


    constructor()
    { super();
        js0.prop(this, ShowNode.PChildren, this);
        js0.prop(this, ShowNode.PCopyable, this, arguments);

        this._show = false;
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active || !this.show)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        if (!this.show)
            return;

        this.refreshDisplayed(true);
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
    }

    __onDeactivate()
    {
        if (!this.show)
            return;

        this.refreshDisplayed(true);
        for (let i = this.pChildren.length - 1; i >= 0; i--)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        for (let i = 0; i < this.pChildren.length; i++) {
            let childFirstHtmlElement = this.pChildren.get(i).firstHtmlElement;
            if (childFirstHtmlElement !== null)
                return childFirstHtmlElement;
        }

        return null;
    }
    /* / Node */

}
module.exports = ShowNode;


Object.defineProperties(ShowNode, {

    PChildren: { value:
    class ShowNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { super(node);

        }

        __onAddChild(childNode, nextNode)
        {
            // if (nextNode === null)
            //     childNode._nextNode = this._nextNode;

            if (this.node.active && this.node.show)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            return this.node.nextNode;
            // if (nextNode !== null)
            //     return nextNode;

            // console.log('Null!');
            // return null;
        }

        __getNextHtmlElement()
        {
            return this.node.nextHtmlElement;
        }

    }},

});


Object.defineProperties(ShowNode, {

    PCopyable: { value:
    class ShowNode_PCopyable extends Node.PCopyable {

        constructor(node, args)
        { super(node, args);

        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new ShowNode();
        }

    }},

});





 });