jsLibs.exportModule('spk-messages', 'Messages', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky'),

    spkMessages = require('.'),

    $layouts = require('./$layouts')
;

class Messages extends spocky.Module
{

    constructor(presets = {}, layout = null)
    { super();
        js0.args(arguments, [ js0.RawObject, js0.Default ], 
                [ spocky.Layout, js0.Null, js0.Default ]);
        js0.typeE(presets, js0.Preset({
            modulePath: [ 'string', js0.Default('/dev/node_modules/spk-messages/'), ],
            images: [ js0.Preset({
                loading: [ 'string', js0.NotSet, js0.Default(js0.NotSet), ],
                success: [ 'string', js0.NotSet, js0.Default(js0.NotSet), ],
                failure: [ 'string', js0.NotSet, js0.Default(js0.NotSet), ],
            }), js0.Default({}) ],
        }));

        if (presets.images.loading === js0.NotSet)
            presets.images.loading = null;
        if (presets.images.success === js0.NotSet)
            presets.images.success = presets.modulePath + 'images/success.png';
        if (presets.images.failure === js0.NotSet)
            presets.images.failure = presets.modulePath + 'images/failure.png';

        this.loading_MinTime = 500;
        this.loading_Timeout = 500;

        this._loading = false;
        this._loading_Start = null;

        this._images = presets.images;

        this._msg = null;
        this._msg_Fn = null;

        this._confirmation = null;
        this._confirmation_Fn = null;

        this._l = layout === null ? new $layouts.Messages() : layout;

        this._l.$fields.loading.image = this._images.loading;
        this._l.$fields.text = (text) => {
            return spkMessages.text(text);
        }

        this._createElems();

        this.hide();

        this.$view = this._l;
    }

    hide()
    {
        this.hideConfirmation();
        this.hideLoading();
        this.hideMessage();
    }

    hideConfirmation(result = false)
    {
        this._confirmation.hide();

        this._l.$fields.confirmation = {
            title: '',
            text: '',
            yes: '',
            no: '',
        };

        if (this._confirmation_Fn !== null) {
            this._confirmation_Fn(result);
            this._confirmation_Fn = null;
        }
    }

    hideLoading()
    {
        this._loading = false;

        let loadingTimeLeft = 1;
        if (this._loading_Start !== null) {
            loadingTimeLeft = Math.max(this.loading_MinTime - 
                ((new Date()).getTime() - this._loading_Start), 1);
        }

        setTimeout(() => {
            if (this._loading)
                return;

            this._loading_Start = null;
            this._l.$fields.loading = {
                show: false,
                text: '',
            };
        }, loadingTimeLeft);

    }

    hideMessage()
    {
        this._msg.hide();

        this._l.$fields.message = {
            image: '',
            title: '',
            text: '',
        };

        if (this._msg_Fn !== null) {
            let msgFn = this._msg_Fn;
            this._msg_Fn = null;
            msgFn();
        }
    }

    showConfirmation(title, text, yesText, noText, fn = null)
    {
        js0.args(arguments, 'string', 'string', 'string', 'string', 
                [ js0.Default, js0.Null, 'function' ])

        this._confirmation_Fn = fn;

        this._l.$fields.confirmation = {
            title: title,
            text: text,
            yes: yesText,
            no: noText,
        };

        this._confirmation.show();
    }

    showLoading(text = '', instant = false)
    {
        js0.args(arguments, [ 'string', js0.Default ],
                [ 'boolean', js0.Default ]);

        this._loading = true;
        if (instant) {
            this._loading_Start = (new Date()).getTime();
            this._l.$fields.loading = {
                text: text,
                show: true,
            };

            return;
        }

        setTimeout(() => {
            if (!this._loading)
                return;

            this._loading_Start = (new Date()).getTime();
            this._l.$fields.loading = {
                text: text,
                show: true,
            };
        }, this.loading_Timeout);
    }

    showMessage(imageSrc, title = '', text = '', fn = null)
    {
        js0.args(arguments, 'string', [ 'string', js0.Default ], 
                [ 'string', js0.Default, ], [ 'function', js0.Null, js0.Default ]);

        this._msg_Fn = fn;
        this._enabled = false;

        this._l.$fields.message = {
            image: imageSrc,
            title: title,
            text: text,
        };

        this._msg.show();
    }

    showMessage_Failure(title = '', text = '', fn = null)
    {
        js0.args(arguments, [ 'string', js0.Default, ], [ 'string', js0.Default, ], 
                [ js0.Default, 'function' ]);

        this.showMessage(this._images.failure, title, text, fn);
    }

    showMessage_Success(title = '', text = '', fn = null)
    {
        js0.args(arguments, [ 'string', js0.Default, ], [ 'string', js0.Default, ], 
                [ js0.Default, 'function' ]);

        this.showMessage(this._images.success, title, text, fn);
    }

    showNotification(message, faIcon = null)
    {
        this._l.$fields.notification = {
            faIcon: faIcon === null ? 'fa-info' : faIcon,
            message: message,
        };

        $(this._l.$elems.notification).fadeIn(() => {
            setTimeout(() => {
                $(this._l.$elems.notification).fadeOut(() => {
                    this._l.$fields.notification = {
                        faIcon: '',
                        message: '',
                    };
                });
            }, 1500);
        });
    }

    _createElems()
    {
        this._msg = new bootstrap.Modal(this._l.$elems.msg);
        this._confirmation = new bootstrap.Modal(this._l.$elems.confirmation);

        this._l.$elems.msg.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideMessage();
        });

        this._l.$elems.yes.addEventListener('click', (evt) => {
            evt.preventDefault();

            this.hideConfirmation(true);
        });

        this._l.$elems.no.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.hideConfirmation(false);
        });
    }

}

module.exports = Messages;
exports = module.exports;




 });