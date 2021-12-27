jsLibs.exportModule('ab-nodes', 'nodes/TextNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class TextNode extends Node
{

    get text() {
        return this._htmlElement.nodeValue;
    }
    set text(value) {
        this._htmlElement.nodeValue = value;
    }


    constructor(text)
    { super();
        js0.prop(this, TextNode.PCopyable, this, arguments);

        this._text = text;
        this._htmlElement = document.createTextNode(text);
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
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
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
module.exports = TextNode;


Object.defineProperties(TextNode, {

    PCopyable: { value:
    class TextNode_PCopyable extends Node.PCopyable
    {

        constructor(node, args)
        {
            super(node, args);
        }

        __createCopy() {
            return new TextNode(this.__args[0]);
        }

    }},

});






 });