jsLibs.exportModule('ab-layouts', 'Parser', (require, module, exports) => { 'use strict';

const abNodes = require('ab-nodes');
const js0 = require('js0');

const LayoutNode = require('./LayoutNode');


class Parser
{

    get __elementsStack() {
        return this._elementsStack;
    }


    constructor(layoutContent)
    {
        this._elementsStack = null;
        this._extendFns = [];
    }

    extend(fn)
    {
        this._extendFns.push(fn);
    }

    parse(layoutContent)
    {
        js0.args(arguments, Array);

        this.__beforeParse();

        let layoutNode = new LayoutNode();

        let parentsStack = [{
            node: null,
            nodeContent: layoutContent,
            elements: [],
        }];

        while (parentsStack.length > 0) {
            let parent = parentsStack.pop();

            for (let i = 0; i < parent.nodeContent.length; i++) {
                let nodeInfo = this._parseNodeInfo(parent.nodeContent[i]);

                let element = this.__createElement(nodeInfo, parent.elements);
                if (!js0.type(element, Parser.Element)) {
                    throw new Error(`\`__createNode\` must return` +
                            ` \`abLayout.Parser.Element\` object.`);
                }

                // if ('_id' in nodeInfo.attribs) {
                //     if (nodeInfo.attribs._id in id_nodes) {
                //         console.warn('Node with id `' + nodeInfo.attribs._id +
                //                 '` already exists.');
                //     }
                //     // id_nodes[nodeInfo.attribs._id] = node;
                // }

                if (parent.node === null)
                    layoutNode.pChildren.add(element.topNode);
                else
                    parent.node.pChildren.add(element.topNode);

                if (nodeInfo.type === '_content')
                    continue;

                if (js0.type(element.bottomNode, js0.Prop(abNodes.Node.PChildren))) {
                    parentsStack.push({
                        node: element.bottomNode,
                        nodeContent: nodeInfo.content,
                        elements: parent.elements.concat([ element ]),
                    });
                }
            }

            // parentNodesStack.pop();
            // parent.nodeContentsStack.pop();
            // return;
        }

        // layoutNode.setIds(id_nodes);

        this.__afterParse();

        return layoutNode;
    }


    _execExtendFns(element)
    {
        for (let extendFn of this._extendFns)
            extendFn(element);
    }

    _parseNodeInfo(nodeInfo)
    {
        /* Validate */
        if (!js0.argsC(arguments, [ Array, 'string' ]) || nodeInfo === null) {
            console.error('Error info:', nodeInfo)
            throw new Error(`Node info must be an \`Array\` or \`string\`.`);
        }
        /* / Validate */
        if (nodeInfo instanceof Array) {
            if (!js0.type(nodeInfo[0], 'string')) {
                console.error('Error info:', nodeInfo);
                throw new Error('First element of node info array must be a string.');
            }

            let nodeType = nodeInfo[0];
            let nodeAttribs = {};
            let nodeContent = [];
            for (let i = 1; i < nodeInfo.length; i++) {
                /* Parse Args */
                if (js0.type(nodeInfo[i], js0.RawObject)) {
                    for (let attribName in nodeInfo[i]) {
                        let attribValue = nodeInfo[i][attribName];

                        if (!js0.type(attribValue, [ 'string', Array ]) ||
                                attribValue === null) {
                            console.error('Error info: ', nodeInfo[i]);
                            throw new Error(`Node attrib must be \`string\` or \`Array\`.`);
                        }

                        if (!(attribName in nodeAttribs))
                            nodeAttribs[attribName] = [];

                        if (js0.type(attribValue, 'string'))
                            nodeAttribs[attribName].push(attribValue);
                        else
                            nodeAttribs[attribName] = nodeAttribs[attribName]
                                    .concat(attribValue);
                    }
                /* Parse Node */
                } else
                    nodeContent.push(nodeInfo[i]);
            }

            let element = {
                type: nodeType,
                attribs: nodeAttribs,
                content: nodeContent,
            };

            this._execExtendFns(element);

            return element;
        } else {
            let element = {
                type: '_content',
                attribs: {},
                content: nodeInfo,
            }

            this._execExtendFns(element);

            return element;
        }

        // let nodeType = nodeInfo_keys[0];
        // let nodeContent = nodeInfo[nodeType];
        // this._validateNodeContent(nodeContent);
        //
        // let nodeAttribs = this._parseNodeAttrs(nodeType, nodeContent);
        // if (nodeAttribs !== null)
        //     nodeContent.splice(0, 1);
        //
    }

    _parseNodeAttrs(nodeType, nodeContent)
    {
        if (nodeContent === null)
            return null;
        if (nodeContent.length === 0)
            return null;
        if (Object.keys(nodeContent[0]).length === 0)
            return {};

        let attribs = null;
        for (let attribName in nodeContent[0]) {
            if (attribName[0] !== '_') {
                if (attribs !== null) {
                    console.error('Error info:', { nodeType:  nodeContent });
                    new Error('Only attribs are allowed in first content element.');
                }

                continue;
            }

            if (attribs === null)
                attribs = {};

            attribs[attribName] = nodeContent[0][attribName];
        }

        return attribs;
    }

    // _validateNodeContent(nodeType, nodeContent)
    // {
    //     if (nodeContent !== null) {
    //         if (!(nodeContent instanceof Array)) {
    //             console.error('Error info:', nodeType, nodeContent);
    //             throw new Error('Node content must be `null` or `Array`.');
    //         }
    //     }
    // }


    __afterParse()
    {

    }

    __beforeParse()
    {

    }


    __createElement(nodeInfo) { js0.virtual(this); }

}
module.exports = Parser;


Object.defineProperties(Parser, {

    Element: { value:
    class
    {

        constructor(topNode, bottomNode, info)
        {
            this.topNode = topNode;
            this.bottomNode = bottomNode;
            this.info = info;
        }

    }},

});






 });