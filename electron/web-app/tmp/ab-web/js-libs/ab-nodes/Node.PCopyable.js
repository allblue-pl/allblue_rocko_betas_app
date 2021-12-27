jsLibs.exportModule('ab-nodes', 'Node.PCopyable', (require, module, exports) => { 'use strict';

const Node = require('./Node');

const js0 = require('js0');


Object.defineProperty(Node, 'PCopyable', { value:
class Node_PCopyable {

    static get Property() { return 'pCopyable'; }


    get node() {
        return this._node;
    }

    get sourceNode() {
        return this._source;
    }


    constructor(node, args)
    {
        js0.args(arguments, Node, null);

        this._node = node;
        this.__args = args;

        this._copies = [];
        this._copies_ByInstanceKeys = {};

        this._source = null;
        this._instanceKeys = [];

        this._listeners_OnCreate = [];
        this._listeners_OnDestroy = [];
    }

    createCopy(instanceKeys, deepCopy = true)
    {
        js0.args(arguments, Array, [ 'boolean', js0.Default ]);
        js0.assert(this._source === null, 'Cannot create copy of a copy.');

        // console.log('CREATE NODE', this.node.constructor.name, instanceKeys);

        let nodeCopy = this.__createCopy(instanceKeys);
        nodeCopy.pCopyable._source = this.node;
        for (let instanceKey of instanceKeys)
            nodeCopy.pCopyable._instanceKeys.push(instanceKey);

        if (deepCopy && js0.type(this.node, js0.Prop(Node.PChildren)))
            this.node.pChildren.createCopy(nodeCopy, instanceKeys);

        this._copies_Add(instanceKeys, nodeCopy);
        // this._copies.push(nodeCopy);

        for (let listener of this._listeners_OnCreate)
            listener(nodeCopy, instanceKeys);

        return nodeCopy;
    }

    deleteCopies(instanceKeys, deepDelete = true)
    {
        js0.args(arguments, Array, [ 'boolean', js0.Default ]);
        js0.assert(this._source === null, 'Cannot create copy of a copy.');

        let nodeCopies = this._copies_Get(instanceKeys, true);
        for (let nodeCopy of nodeCopies) {
            for (let i = this._copies.length - 1; i >= 0; i--) {
                if (this._copies[i] !== nodeCopy)
                    continue;

                for (let listener_OnDestroy of this._listeners_OnDestroy)
                    listener_OnDestroy(nodeCopy, instanceKeys);

                this._copies.splice(i, 1);

                break;
            }    
        }

        if (deepDelete && js0.type(this.node, js0.Prop(Node.PChildren)))
            this.node.pChildren.deleteCopies(this.node, instanceKeys);
    }

    getInstanceKeys()
    {
        return this._instanceKeys.slice();
    }

    getNodeCopies(instanceKeys = null)
    {
        js0.args(arguments, [ Array, js0.Default ]);

        if (instanceKeys === null)
            return this._copies.slice();

        // console.log('QQQ', this._copies.length);

        return this._copies_Get(instanceKeys);

        // let nodeCopies = [];
        // for (let nodeCopy of this._copies) {
        //     // console.log('WTF?');
        //     // console.log('Bam', instanceKeys, nodeCopy.pCopyable._instanceKeys);
        //     if (nodeCopy.pCopyable.matchInstanceKeys(instanceKeys))
        //         nodeCopies.push(nodeCopy);
        // }

        // return nodeCopies;
    }

    getOriginalNode()
    {
        let sourceNode = this.node;
        while (sourceNode.pCopyable._source !== null)
            sourceNode = this._source;

        return sourceNode;
    }

    matchInstanceKeys(instanceKeys, exact = true)
    {
        js0.args(arguments, Array);

        if (this._source === null)
            throw new Error(`\`matchInstanceKeys\` on node that is not a copy.`);

        if (exact) {
            if (instanceKeys.length !== this._instanceKeys.length)
                return false;
        }

        for (let i = 0; i < instanceKeys.length; i++) {
            if (instanceKeys[i] === null)
                continue;

            if (instanceKeys[i] !== this._instanceKeys[i])
                return false;
        }

        return true;
    }

    onCreate(onCreateListener)
    {
        this._listeners_OnCreate.push(onCreateListener);
    }

    onDestroy(onDestroyListener)
    {
        this._listeners_OnDestroy.push(onDestroyListener);
    }


    _copies_Add(instanceKeys, nodeCopy)
    {
        let copies_Root = this._copies_GetRoot(this._copies_ByInstanceKeys,
                instanceKeys, true);

        if (!('_$nodes' in copies_Root))
            copies_Root._$nodes = [];

        copies_Root._$nodes.push(nodeCopy);
        this._copies.push(nodeCopy);
    }

    _copies_Get(instanceKeys, remove = false)
    {
        let copies_Root = this._copies_GetRoot(this._copies_ByInstanceKeys,
                instanceKeys, false);
        if (copies_Root === null)
            return [];

        if (!('_$nodes' in copies_Root))
            return [];

        if (remove) {
            let nodeCopies = copies_Root._$nodes;
            copies_Root._$nodes = [];
            return nodeCopies;
        } else
            return copies_Root._$nodes.slice();
    }

    _copies_GetRoot(copies_Current, instanceKeys, create)
    {
        for (let i = 0; i < instanceKeys.length; i++) {
            if (instanceKeys[i] === null) {
                let copies = {
                    _$nodes: [],
                };

                for (let instanceKey_T in copies_Current) {
                    let copies_New = this._copies_GetRoot(copies_Current[instanceKey_T],
                            instanceKeys.slice(1), create);
                    if (copies_New !== null) {
                        if ('_$nodes' in copies_New) {
                            copies._$nodes = copies._$nodes.concat(copies_New._$nodes);
                        }
                    }
                }

                return copies;
            }
            
            if (!(instanceKeys[i] in copies_Current)) {
                if (create)
                    copies_Current[instanceKeys[i]] = {};
                else
                    return null;
            }

            copies_Current = copies_Current[instanceKeys[i]];
        }

        return copies_Current;
    }

    // _copies_GetRoot(instanceKeys, create)
    // {
    //     let copies_Current = this._copies_ByInstanceKeys;

    //     for (let i = 0; i < instanceKeys.length; i++) {
    //         if (!(instanceKeys[i] in copies_Current)) {
    //             if (create)
    //                 copies_Current[instanceKeys[i]] = {};
    //             else
    //                 return null;
    //         }

    //         copies_Current = copies_Current[instanceKeys[i]];
    //     }

    //     return copies_Current;
    // }

    __addInstance(key, instanceNode)
    {
        js0.args(arguments, [ 'string', 'number' ],
                require('./nodes/RepeatNode').InstanceNode);

        this._instanceInfos.push({
            key: key,
            instanceNode: instanceNode
        });

        instanceNode.addNodeCopy(this.node);
    }

    // __setSourceNode(sourceNode)
    // {
    //     js0.args(arguments, Node);
    //
    //     this._source = sourceNode;
    // }

    __createCopy(instanceKeys) { js0.virtual(this); }

}});
module.exports = Node.PCopyable;






 });