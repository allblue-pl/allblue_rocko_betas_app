jsLibs.exportModule('ab-nodes', 'nodes/RepeatNode.InstanceNode', (require, module, exports) => { 'use strict';

const RepeatNode = require('./RepeatNode');

const js0 = require('js0');

const Node = require('../Node');


Object.defineProperty(RepeatNode, 'InstanceNode', { value:
class RepeatNode_InstanceNode extends Node
{

    get key() {
        return this._key;
    }

    constructor(repeatNode, key)
    { super();
        js0.args(arguments, RepeatNode);
        js0.prop(this, RepeatNode.InstanceNode.PChildren, this);
        // js0.prop(this, RepeatNode.InstanceNode.PCopyable, this);

        this._key = key;

        this._repeatNode = repeatNode;
        this._nodeCopies = [];
    }

    addNodeCopy(nodeCopy)
    {
        this._nodeCopies.push(nodeCopy);
    }


    /* Node */
    __isDisplayed()
    {
        return this._repeatNode.displayed && this.active;
    }

    __onActivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
    }

    __onDeactivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        return this._repeatNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        if (this.pChildren.length > 0)
            return this.pChildren.get(0).firstHtmlElement;

        return null;
    }
    /* / Node */

}, });
module.exports = RepeatNode.InstanceNode;


Object.defineProperties(RepeatNode.InstanceNode, {

    PChildren: { value:
    class RepeatNode_InstanceNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { 
            super(node);
        }

        __onAddChild(childNode, nextNode)
        {
            if (this.node.active)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            let instanceIndex = this.node._repeatNode._instances.indexOf(
                    this.node);
            js0.assert(instanceIndex !== -1, 'Instance not in repeat node.');

            if (instanceIndex === this.node._repeatNode._instances.size - 1)
                return this.node._repeatNode.nextNode;

            return this.node._repeatNode._instances.getAt(instanceIndex + 1);
        }

        __getNextHtmlElement()
        {   
            /* Not Sure */
            if (!this.node._repeatNode.active)
                return this.node._repeatNode.nextHtmlElement;
            /* / Not Sure */

            let startIndex = this.node._repeatNode._instances.indexOf(this.node) + 1;
            for (let i = startIndex; i < this.node._repeatNode._instances.size; i++) {
                let instance = this.node._repeatNode._instances.getAt(i);
                if (instance.pChildren.length > 0)
                    return instance.pChildren.get(0).firstHtmlElement;
            }

            return this.node._repeatNode.nextHtmlElement;
        }

    }},


    // PCopyable: { value:
    // class RepeatNode_InstanceNode_PCopyable extends Node.PCopyable
    // {
    //
    //     __createCopy(instance_nodes)
    //     {
    //         throw new Error('To do.');
    //         // return new RepeatNode.InstanceNode(this.__args[0]);
    //     }
    //
    // }},

});






 });