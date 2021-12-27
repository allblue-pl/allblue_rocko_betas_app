jsLibs.exportModule('ab-nodes', 'nodes/RepeatNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');

const TextNode = require('./TextNode');


class RepeatNode extends Node
{

    constructor()
    { super();
        js0.prop(this, RepeatNode.PChildren, this);
        js0.prop(this, RepeatNode.PCopyable, this, arguments);

        this._instances = new js0.List();
    }

    add(key)
    {
        if (this._instances.has(key))
            throw new Error(`Instance with key \`${key}\` already exists.`);

        let instance = new RepeatNode.InstanceNode(this, key);

        this._instances.set(key, instance);
        let node_Original = this.pCopyable.getOriginalNode();

        let instanceKeys = this.pCopyable._instanceKeys.concat([ key ]);
        for (let i = 0; i < node_Original.pChildren.length; i++) {
            let newChildNode = node_Original.pChildren.get(i).pCopyable
                    .createCopy(instanceKeys);
            instance.pChildren.add(newChildNode);
        }
            
        if (this.active)
            instance.activate();
    }

    addAt(index, key)
    {
        if (this._instances.has(key))
            throw new Error(`Instance with key \`${key}\` already exists.`);
        if (index < 0)
            throw new Error(`Index '${index}' cannot be lower than 0.`);
        if (index > this._instances.size)
            throw new Error(`Index '${index}' cannot be higher than instances size '${this._instances.size}'.`);

        let instance = new RepeatNode.InstanceNode(this, key);

        this._instances.addAt(index, key, instance);
        let node_Original = this.pCopyable.getOriginalNode();

        let instanceKeys = this.pCopyable._instanceKeys.concat([ key ]);

        for (let i = 0; i < node_Original.pChildren.length; i++) {
            let newChildNode = node_Original.pChildren.get(i).pCopyable
                    .createCopy(instanceKeys);

            instance.pChildren.add(newChildNode);
        }

        if (this.active)
            instance.activate();
    }

    delete(key)
    {
        if (!this._instances.has(key))
            throw new Error(`Instance with key \`${key}\ does not exist.`);

        let instance = this._instances.get(key);
        this._instances.delete(key);

        let node_Original = this.pCopyable.getOriginalNode();
        let instanceKeys = this.pCopyable._instanceKeys.concat([ key ]);
        for (let i = 0; i < node_Original.pChildren.length; i++)
            node_Original.pChildren.get(i).pCopyable.deleteCopies(instanceKeys);
        //
        // for (let i = 0; i < node_Original.pChildren.length; i++) {
        //
        //     let newChildNode = node_Original.pChildren.get(i).pCopyable.createCopy(
        //             true, this.pCopyable._instanceKeys.concat([ key ]));
        //     instance.pChildren.add(newChildNode);
        // }

        if (this.active)
            instance.deactivate();
    }

    getInstanceNodeCopies(sourceNode, key)
    {
        js0.args(arguments, Node, [ 'string', 'number' ]);

        if (!this._instances.has(key))
            return null;

        let instance = this._instances.get(key);

        let nodeCopies = [];
        for (let nodeCopy of instance._nodeCopies) {
            if (nodeCopy.pCopyable.sourceNode === sourceNode)
                nodeCopies.push(nodeCopy);
        }

        return nodeCopies;
    }

    pop()
    {
        if (this._instances.size <= 0)
            throw new Error('Cannot `pop` on empty `RepeatNode`.');

        let key = Array.from(this._instances.keys)[this._instances.size - 1];
        let lastInstance = this._instances.get(key);

        if (this.active)
            lastInstance.deactivate();
    }

    push()
    {
        let index = 0;
        while(this._instances.has(index))
            index++;

        this.add(index);
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

        for (let i = 0; i < this._instances.size; i++)
            this._instances.getAt(i).activate();
    }

    __onDeactivate()
    {
        for (let i = this._instances.size - 1; i >= 0; i--)
            this._instances.getAt(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this._instances.size === 0 ?
                null : this._instances.getAt(0).firstHtmlElement;
    }
    /* / Node */

}
module.exports = RepeatNode;


Object.defineProperties(RepeatNode, {

    PChildren: { value:
    class extends Node.PChildren {

        constructor(node)
        {
            super(node);
        }

        __onAddChild(childNode, nextNode)
        {
            js0.typeE(childNode, js0.Prop(Node.PCopyable));
            // js0.args(arguments, js0.Prop(Node.PCopyable), Node);
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            return this.nextNode;
        }

        __getNextHtmlElement()
        {
            if (this.node.hasParent)
                return this.node.parentNode.nextHtmlElement;

            return null;
        }

    }},


    PCopyable: { value:
    class RepeatNode_PCopyable extends Node.PCopyable
    {

        __createCopy(nodeInstance)
        {
            return new RepeatNode();
        }

    }},

});


require('./RepeatNode.InstanceNode');






 });