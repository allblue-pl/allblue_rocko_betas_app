jsLibs.exportModule('ab-nodes', 'Node', (require, module, exports) => { 'use strict';

const js0 = require('js0');


class Node
{

    get active() {
        return this._active;
    }

    get displayed() {
        return this._displayed;
    }

    get firstHtmlElement() {
        let firstHtmlElement = this.__getFirstHtmlElement();
        if (!js0.type(firstHtmlElement, [ HTMLElement, Text, js0.Null ])) {
            throw new Error(`\`__getFirstHtmlElement\` in \`${this.constructor.name}\`` +
                    `does not return \`HTMLElement\`.`);
        }

        if (firstHtmlElement !== null)
            return firstHtmlElement;

        if (this.hasParent) {
            let nextHtmlElement = this.parentNode.pChildren.findNextHtmlElement(this);
            if (nextHtmlElement === null)
                return null;

            return nextHtmlElement;
        }

        return null;;
    }

    get hasParent() {
        return this._parentNode !== null;
    }

    get htmlElement() {
        let htmlElement = this.__getHtmlElement();
        if (!js0.type(htmlElement, HTMLElement)) {
            throw new Error(`\`__getHtmlElement\` in \`${this.constructor.name}\`` +
                    `does not return \`HTMLElement\`.`);
        }

        return htmlElement;
    }

    get nextHtmlElement() {
        if (this.hasParent)
            return this.parentNode.pChildren.findNextHtmlElement(this)

        return null;
    }

    get nextNode() {
        return this.hasParent ? this.parentNode.pChildren.__getNext(this) : null;
    }

    get parentNode() {
        // if (this._parentNode === null)
        //     throw new Error('Parent node not set.');

        return this._parentNode;
    }


    constructor()
    {
        this._active = false;
        this._displayed = false;
        
        this._parentNode = null;

        this._listeners_OnDisplay = [];
    }

    activate()
    {
        if (this.active)
            return;
        this._active = true;

        this.__onActivate();
    }

    addListener_OnDisplay(listener)
    {
        this._listeners_OnDisplay.push(listener);
    }

    deactivate()
    {
        if (!this.active)
            return;
        this._active = false;

        this.__onDeactivate();
    }

    refreshDisplayed(refreshChildren = false)
    {
        let displayed = this.__isDisplayed();
        if (this._displayed === displayed)
            return;

        this._displayed = displayed;
        for (let listener of this._listeners_OnDisplay)
            listener(displayed);

        if (refreshChildren) {
            if (js0.type(this, js0.Prop(Node.PChildren))) {
                for (let i = 0; i < this.pChildren.length; i++)
                    this.pChildren.get(i).refreshDisplayed(true);
            }
        }
    }

    removeListener_OnDisplay(listener)
    {
        for (let i = this._listeners_OnDisplay.length - 1; i >= 0; i--) {
            if (this._listeners_OnDisplay[i] === listener)
                this._listeners_OnDisplay.splice(i, 1);
        }
    }


    __getHtmlElement() { js0.virtual(this); }
    __getFirstHtmlElement() { js0.virtual(this); }

    __isDisplayed() { js0.virtual(this); }

    __onActivate() { js0.virtual(this); }
    __onDeactivate() { js0.virtual(this); }

}
module.exports = Node;
require('./Node.PChildren');
require('./Node.PCopyable');






 });