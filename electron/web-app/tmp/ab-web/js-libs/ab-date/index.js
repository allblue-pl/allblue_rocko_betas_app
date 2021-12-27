jsLibs.exportModule('ab-date', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abDate_Class
{

    get utcOffset() {
        return this._utcOffset;
    }
    set utcOffset(value) {
        throw new Error('Read only property.');
    }

    get utcOffset_Time() {
        return this.utcOffset * this.span_Hour;
    }


    constructor()
    {
        this.span_Minute = 60;
        this.span_Hour = 60 * 60;
        this.span_Day = 24 * 60 * 60;

        this.formats_Date = 'DD.MM.YYYY';
        this.formats_DateTime = 'DD.MM.YYYY HH:mm';
        this.formats_Time = 'HH:mm';

        this._utcOffset = 0;
    }

    format(time, format, utcOffset = null)
    {
        utcOffset = utcOffset === null ? this.utcOffset : utcOffset;

        if (time === null)
            return '-';

        return moment.utc(time * 1000).utcOffset(utcOffset)
                .format(format);
    }

    format_Date(time, format = null, utcOffset = null)
    {
        format = format === null ? this.formats_Date : format;
        utcOffset = utcOffset === null ? this.utcOffset : utcOffset;

        if (time === null)
            return '-';

        return moment.utc(time * 1000).utcOffset(utcOffset)
                .format(format);
    }

    format_Date_UTC(time, format = null)
    {
        return this.format_Date(time, format, 0);
    }

    format_DateTime(time, format = null, utcOffset = null)
    {
        format = format === null ? this.formats_DateTime : format;
        utcOffset = utcOffset === null ? this.utcOffset : utcOffset;

        if (time === null)
            return '-';

        return moment.utc(time * 1000).utcOffset(utcOffset).format(format);
    }

    format_DateTime_UTC(time, format = null)
    {
        return this.format_DateTime(time, format, 0);
    }

    format_Time(time, format = null, utcOffset = null)
    {
        format = format === null ? this.formats_Time : format;
        utcOffset = utcOffset === null ? this.utcOffset : utcOffset;

        if (time === null)
            return '-';

        /* UTC because we are interested only in day. */
        return moment.utc(time * 1000).utcOffset(utcOffset).format(format);
    }

    format_Time_UTC(time, format = null)
    {
        return this.format_Time(time, format, 0);
    }

    getDate(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            return new Date();
            
        return new Date(time * 1000);
    }

    getDay(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();

        return this.getDay_UTC(time + this.utcOffset_Time) - this.utcOffset_Time;
    }

    getDay_UTC(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();

        // return Math.floor(time / this.span_Day) * this.span_Day;
        return time - time % this.span_Day;
    }

    getDayOfWeek(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();
        time += this.utcOffset_Time;

        return this.getDayOfWeek_UTC(time);
    }

    getDayOfWeek_UTC(time)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        let date = new Date(time * 1000);

        return date.getUTCDay();
    }

    getDayNr(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();
        time += this.utcOffset_Time;

        return this.getDayNr_UTC(time);
    }

    getDayNr_UTC(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();

        return this.getDate(time).getUTCDate() - 1;
    }

    getDaysCountInMonth(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();
        time += this.utcOffset_Time;

        return this.getDaysCountInMonth_UTC(time);
    }

    getDaysCountInMonth_UTC(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = abDate.getTime();

        let year = this.getYearNr_UTC(time);
        let month = this.getMonthNr_UTC(time);

        return (new Date(year, month + 1, 0)).getDate();

    }

    getMonth(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        return this.getDay(time) - this.getDayNr(time) * this.span_Day;
    }

    getMonth_UTC(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        return this.getDay_UTC(time) - this.getDayNr_UTC(time) * this.span_Day;
    }

    getMonthNr(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();
        time += this.utcOffset_Time;

        return this.getMonthNr_UTC(time);
    }
    
    getMonthNr_UTC(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();

        return this.getDate(time).getUTCMonth();
    }

    getTime(date = new Date())
    {
        js0.args(arguments, [ Date, js0.Default ]);

        return Math.floor(date.getTime() / 1000);
    }

    getTime_Rel(time = null)
    {
        js0.args(arguments, [ 'number', js0.Default ]);

        if (time === null)
            time = this.getTime();

        return time - this.utcOffset_Time;
    }

    getYearNr(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = this.getTime();
        time += this.utcOffset_Time;

        return this.getYearNr_UTC(time);
    }

    getYearNr_UTC(time = null)
    {
        js0.args(arguments, [ 'number', js0.Null, js0.Default ]);

        if (time === null)
            time = abDate.getTime();

        return this.getDate(time).getUTCFullYear();
    }

    setUTCOffset(utcOffset)
    {
        js0.args(arguments, 'int');

        this._utcOffset = utcOffset;
    }

    strToTime(str, timeFormat)
    {
        return moment.utc(str, timeFormat)
                .toDate().getTime() / 1000 - this.utcOffset_Time;
    }

    strToTime_UTC(str, timeFormat)
    {
        return moment.utc(str, timeFormat)
                .toDate().getTime() / 1000;
    }

    strToTime_Date(str)
    {
        if (str === '')
            return null;

        return moment.utc(str, this.formats_Date)
                .toDate().getTime() / 1000 - this.utcOffset_Time;
    }

    strToTime_Date_UTC(str)
    {
        if (str === '')
            return null;

        return moment.utc(str, this.formats_Date)
                .toDate().getTime() / 1000;
    }

    strToTime_DateTime(str)
    {
        if (str === '')
            return null;

        return moment.utc(str, this.formats_DateTime)
                .toDate().getTime() / 1000 - this.utcOffset_Time;
    }

    strToTime_DateTime_UTC(str)
    {
        if (str === '')
            return null;

        return moment.utc(str, this.formats_DateTime)
                .toDate().getTime() / 1000;
    }

    strToTime_Time(str)
    {
        if (str === '')
            return null;

        var timestamp = moment.utc(str, this.formats_Time)
                .toDate().getTime() / 1000 - this.utcOffset_Time;

        return timestamp % this.span_Day;
    }

    strToTime_Time_UTC(str)
    {
        if (str === '')
            return null;

        var timestamp = moment.utc(str, this.formats_Time)
                .toDate().getTime() / 1000;

        return timestamp % this.span_Day;
    }

}
module.exports = new abDate_Class();






 });