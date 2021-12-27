jsLibs.exportModule('ab-timer', 'Timer', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Timer
{

    constructor(runFn, interval)
    {
        js0.args(arguments, 'function', 'number');

        this._runFn = runFn;
        this._interval = interval;
        this._interval_Elapsed = null;
        this._lastTick = null;

        this._running = false;
        this._startIndex = 0;

        this._time_Start = null;
        this._time_Pause = null;
        this._time_PauseElapsed = 0;
        this._ticksCount = 0;
    }

    isRunning()
    {
        return this._running;
    }

    start()
    {
        if (this._running)
            return;

        if (this._time_Start === null)
            this._time_Start = (new Date()).getTime();
        else {
            this._time_PauseElapsed += (new Date()).getTime() - this._time_Pause;
            this._time_Pause = null;
        }

        this._lastTick = (new Date()).getTime();
        let startIndex_Current = this._startIndex;

        let tick = () => {            
            if (this._startIndex > startIndex_Current)
                return;
            if (!this._running)
                return;
            
            this._ticksCount++;
            let currentTime = (new Date()).getTime(); 
            let elapsedTime_Total = currentTime - (this._time_Start + this._time_PauseElapsed);
            let elapsedTime_Diff = this._ticksCount * this._interval - elapsedTime_Total;

            let elapsedTime = this._interval + elapsedTime_Total - Math.floor(
                    elapsedTime_Total / this._interval) * this._interval;

            this._interval_Elapsed = null;
            this._lastTick = (new Date()).getTime();

            this._runFn(elapsedTime, elapsedTime_Total);

            setTimeout(() => {
                tick();
            }, this._interval + elapsedTime_Diff);
        };

        this._lastTick = (new Date()).getTime();
        let firstInterval = this._interval_Elapsed === null ? 
                this._interval : (this._interval - this._interval_Elapsed);
        
        this._running = true;
        setTimeout(() => {
            tick();
        }, firstInterval);
    }

    stop()
    {
        if (!this._running)
            return;

        this._time_Pause = (new Date()).getTime();

        this._startIndex++;
        this._running = false;
        this._interval_Elapsed = (new Date()).getTime() - this._lastTick;
    }

}

module.exports = Timer;
exports = module.exports;




 });