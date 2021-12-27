jsLibs.exportModule('ab-nodes', 'Node.PChildren', (require, module, exports) => { 'use strict';

const Node = require('./Node')

const js0 = require('js0');


Object.defineProperty(Node, 'PChildren', { value:
class Node_PChildren {

    static get Property() { return 'pChildren'; }

    get length(){
        return this._children.length;
    }

    get node() {
        return this._node;
    }


    constructor(node)
    {
        js0.args(arguments, Node);

        this._node = node;
        this._children = [];
    }

    add(childNode, nextNode = null)
    {
        js0.args(arguments, Node, [ Node, js0.Default ]);

        let insertIndex = nextNode === null ?
                this._children.length : this._children.indexOf(nextNode);
        if (insertIndex === -1)
            new Error('`nextNode` does not exist in `childNode` parent.');

        childNode._parentNode = this._node;

        this._children.splice(insertIndex, 0, childNode);

        this.__onAddChild(childNode);
    }

    // addAt(index, childNode)
    // {
    //     js0.args(arguments, 'number', Node);

    //     if (index < 0)
    //         throw new Error(`Index '${index}' cannot be lower than 0.`);
    //     if (index > this._children.length)
    //         throw new Error(`Index '${index}' cannot be higher than children size '${this._children.length}'.`);
        
    //     childNode._parentNode = this._node;

    //     this._children.splice(index, 0, childNode);

    //     this.__onAddChild(childNode);
    // }

    createCopy(topNodeCopy, instanceKeys)
    {
        js0.args(arguments, Node, Array);
        js0.typeE(this._node, js0.Prop(Node.PCopyable));

        let nodeCopiesStack = [ topNodeCopy ];

        while(nodeCopiesStack.length > 0) {
            let nodeCopy = nodeCopiesStack.pop();
            let children = nodeCopy.pCopyable.getOriginalNode().pChildren;

            for (let i = 0; i < children.length; i++) {
                let childNodeCopy = children.get(i).pCopyable
                        .createCopy(instanceKeys, false);

                nodeCopy.pChildren.add(childNodeCopy);

                if (!js0.type(childNodeCopy, js0.Prop(Node.PChildren)))
                    continue;

                // /* Copy only first repeat node. */
                // console.log('Test', nodeCopy === top_node);
                if (js0.type(childNodeCopy, require('./nodes/RepeatNode')))
                    continue;

                nodeCopiesStack.push(childNodeCopy);
            }
        }
    }

    deleteCopies(topOriginalNode, instanceKeys)
    {
        js0.args(arguments, Node, Array);

        let originalNodesStack = [ topOriginalNode ];

        while(originalNodesStack.length > 0) {
            let originalNode = originalNodesStack.pop();
            let children = originalNode.pChildren;

            for (let i = 0; i < children.length; i++) {
                let childNode = children.get(i);

                childNode.pCopyable.deleteCopies(instanceKeys, false);

                if (!js0.type(childNode, js0.Prop(Node.PChildren)))
                    continue;

                originalNodesStack.push(childNode);
            }

            // nodeCopiesStack.shift();
            // children_stack.shift();
        }

        return topOriginalNode;
    }

    findNext(childNode)
    {
        let childNodeIndex = this._children.indexOf(childNode);
        js0.assert(childNodeIndex !== -1, '`childNode` not found.');

        if (childNodeIndex < this._children.length - 1)
            return this._children[childNodeIndex + 1];

        return null;
    }

    findNextHtmlElement(childNode)
    {
        let nextHtmlElement = null;
    
        // console.log('Test', this.node, childNode)

        let nextNode = this.findNext(childNode);
        if (nextNode !== null)
            nextHtmlElement = nextNode.firstHtmlElement;

        if (nextHtmlElement !== null)
            return nextHtmlElement;

        nextHtmlElement = this.__getNextHtmlElement();

        // js0.assert(typeof nextHtmlElement !== 'undefined', '???');
        // if (typeof nextHtmlElement === 'undefined')
        //     throw new Error();

        return nextHtmlElement;
    }

    // findNextHtmlElement(childNode)
    // {
    //     let nextHtmlElement = null;
     
    //     let startIndex = null;
    //     for (let i = 0; i < this._children.length; i++) {
    //         if (this._children[i] === childNode) {
    //             startIndex = i + 1;
    //             break;
    //         }
    //     }

    //     if (startIndex === null)
    //         throw new Error(`Node '${childNode}' is not a child of '${this._node}'.`);

    //     for (let i = startIndex; i < this._children.length; i++) {
    //         let nextNode = this._children[i];
    //         let nextHtmlElement = nextNode.__getFirstHtmlElement();
    //         if (!js0.type(nextHtmlElement, [ HTMLElement, Text, js0.Null ])) {
    //             throw new Error(`\`__getFirstHtmlElement\` in \`${this.constructor.name}\`` +
    //                     `does not return \`HTMLElement\`.`);
    //         }

    //         if (nextHtmlElement !== null)
    //             return nextHtmlElement;
            
    //             nextHtmlElement = this.__getNextHtmlElement();
    //         if (nextHtmlElement !== null)
    //             return nextHtmlElement;
    //     }

    //     return null;
    // }

    get(childNodeIndex)
    {
        return this._children[childNodeIndex];
    }

    remove(childNode)
    {
        js0.args(arguments, Node);

        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i] === childNode) {
                childNode.refreshDisplayed(true);
                childNode.deactivate();
                this._children.splice(i, 1);
            }
        }
    }

    __getNext(childNode)
    {
        return this.findNext(childNode);
    }

    __getNextHtmlElement()
    {
        return null;
    }

    __onAddChild() { js0.virtual(this); }

}});
module.exports = Node.PChildren;






 });