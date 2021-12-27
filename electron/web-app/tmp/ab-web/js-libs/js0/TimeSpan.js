jsLibs.exportModule('js0', 'TimeSpan', (require, module, exports) => { 'use strict';

class TimeSpan
{

    static GetInstance(instanceAlias)
    {
        if (!(instanceAlias in TimeSpan.Instances))
            throw new Error(`TimeSpan instance '${instanceAlias}' does not exist.`);

        return TimeSpan.Instances[instanceAlias];
    }

    static MarkStart(instanceAlias, markAlias)
    {
        if (!(instanceAlias in TimeSpan.Instances))
            TimeSpan.Instances[instanceAlias] = new TimeSpan();
        let instance = TimeSpan.Instances[instanceAlias];

        return instance.markStart(markAlias);
    }


    constructor()
    {
        this._start = (new Date()).getTime();
        this._marks = [];
    }

    getDiffs()
    {
        let diffs = [];
        for (let mark of this._marks) {
            diffs.push([ mark.alias, mark.timeEnd === null ? null : 
                    mark.timeEnd - mark.timeStart ]);
        }

        return diffs;
    }

    markStart(markAlias)
    {
        this._marks.push({
            alias: markAlias,
            timeStart: (new Date()).getTime(),
            timeEnd: null,
        });

        return new TimeSpan_Mark(this, this._marks.length - 1);
    }

}
TimeSpan.Instances = {};

class TimeSpan_Mark
{
    
    constructor(instance, index)
    {
        this._instance = instance;
        this._index = index;
    }

    end()
    {
        this._instance._marks[this._index].timeEnd = (new Date()).getTime();
    }

}

module.exports = TimeSpan;





 });