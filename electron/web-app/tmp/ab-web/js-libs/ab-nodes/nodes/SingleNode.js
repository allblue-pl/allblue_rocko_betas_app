jsLibs.exportModule('ab-nodes', 'nodes/SingleNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class SingleNode extends Node
{

    constructor(htmlElementType)
    { super();
        js0.args(arguments, 'string');
        js0.prop(this, SingleNode.PChildren, this);
        js0.prop(this, SingleNode.PCopyable, this, arguments);

        this._htmlElement = document.createElement(htmlElementType);
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        HtmlElement.AddChild(this.parentNode.htmlElement, this._htmlElement,
                this.nextHtmlElement);

        // for (let i = 0; i < this.pChildren.length; i++)
        //     this.pChildren.get(i).refreshDisplayed(true);
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
        // for (let i = this.pChildren.length - 1; i >= 0; i--)
        //     this.pChildren.get(i).refreshDisplayed(true);

        HtmlElement.RemoveChild(this.parentNode.htmlElement, this._htmlElement);
    }

    __getHtmlElement()
    {
        return this._htmlElement;
    }

    __getFirstHtmlElement()
    {
        if (!this.active)
            return null;

        return this._htmlElement;
    }
    /* / Node */

}
module.exports = SingleNode;


Object.defineProperties(SingleNode, {

    PChildren: { value:
    class SingleNode_PChildren extends Node.PChildren
    {

        constructor(node)
        {
            super(node);
        }

        __onAddChild(childNode, next_node)
        {
            childNode.activate();
        }

    }},


    PCopyable: { value:
    class SingleNode_PCopyable extends Node.PCopyable
    {

        constructor(node, args)
        {
            super(node, args);
        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new SingleNode(this.__args[0]);
        }

    }},

});






 });