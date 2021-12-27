jsLibs.exportModule('ab-nodes', 'nodes/HideNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const Node = require('../Node');


class HideNode extends Node
{

    get hide() {
        return this._hide;
    }
    set hide(hideValue) {
        js0.args(arguments, 'boolean');

        if (hideValue === this._hide)
            return;
        this._hide = hideValue;

        if (!this.active)
            return;

        if (hideValue) {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).deactivate();
            this.refreshDisplayed(true);
        } else {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).activate();
            this.refreshDisplayed(true);
        }
    }


    constructor()
    { super();
        js0.prop(this, HideNode.PChildren, this);
        js0.prop(this, HideNode.PCopyable, this, arguments);

        this._hide = false;
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active || this.hide)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        if (this.hide)
            return;

        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        if (this.hide)
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
module.exports = HideNode;


Object.defineProperties(HideNode, {

    PChildren: { value:
    class HideNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { super(node);

        }

        __onAddChild(childNode, nextNode)
        {
            // if (nextNode === null)
            //     childNode._nextNode = this._nextNode;

            if (this.node.active && !this.node.hide)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            return this.node.nextNode;
        }

        __getNextHtmlElement()
        {
            return this.node.nextHtmlElement;
        }

    }},

});


Object.defineProperties(HideNode, {

    PCopyable: { value:
    class HideNode_PCopyable extends Node.PCopyable {

        constructor(node, args)
        { super(node, args);

        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new HideNode();
        }

    }},

});





 });