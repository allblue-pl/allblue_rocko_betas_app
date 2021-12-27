jsLibs.exportModule('web-ab-api', 'index', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    Result = require('./Result')
;


class abApi_Class
{

    get Result() {
        return Result;
    }

    constructor()
    {
        this.debug = false;
        this.requestTimeout = 30000;
    }

    json(uri, json, fn, timeout = null) 
    {
        js0.args(arguments, 'string', js0.RawObject, 'function', 
                [ 'int', js0.Null, js0.Default ]);

        var json_string = JSON.stringify(json);
        if (json_string === null)
            throw new Error('Cannot parse json.');

        this.post(uri, { json: json_string }, fn, timeout);
    }

    async json_Async(uri, json, timeout = null)
    {
        js0.args(arguments, 'string', js0.RawObject, [ 'int', js0.Null, js0.Default ]);

        return new Promise((resolve, reject) => {
            this.json(uri, json, (result) => {
                resolve(result);
            }, timeout);
        });
    }

    post(uri, fields, fn, timeout = null)
    {
        js0.args(arguments, 'string', js0.RawObject, 'function', 
                [ 'int', js0.Null, js0.Default ]);

        timeout = timeout === null ? this.requestTimeout : timeout;

        var form_data = new FormData();
        for (var field_name in fields)
            form_data.append(field_name, fields[field_name]);

        var request = new XMLHttpRequest();

        request.open('POST', uri, true);
        request.onerror = (evt) => {
            let result = Result.Error('Http request error.');
            fn(result);
        };
        request.onload = () => {
            if (request.status >= 200 && request.status < 400) {
                var result = Result.Parse(request.responseText, uri, this.debug);

                if (this.debug)
                    console.log('webABApi', uri, fields, result);

                fn(result);
            } else {
                if (status === 408)
                    fn(Result.ConnectionError());
                else {
                    let result = Result.Error('Http request error.');
                    result.data.request = request;
                    
                    fn(result);
                }
            }
        };
        request.send(form_data);
    }

    setDebug(debug)
    {
        this.debug = debug;
    }

    upload(uri, json, files, fn, timeout = null)
    {
        var fields = {};
        for (var file_name in files) {
            if (files[file_name] === null) {
                json[file_name] = null;
            } else {
                fields[file_name] = files[file_name];
            }
        }

        var json_string = JSON.stringify(json);
        if (json_string === null)
            throw new Error('Cannot parse json.');
        fields.json = json_string;

        this.post(uri, fields, fn, timeout);
    }

    async upload_Async(uri, json, files, timeout = null)
    {
        js0.args(arguments, 'string', js0.RawObject, [ 'int', js0.Null, js0.Default ]);

        return new Promise((resolve, reject) => {
            this.upload(uri, json, files, (result) => {
                resolve(result);
            }, timeout);
        });
    }

}
module.exports = new abApi_Class();





 });