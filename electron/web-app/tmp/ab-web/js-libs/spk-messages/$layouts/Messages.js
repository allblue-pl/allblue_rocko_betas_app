jsLibs.exportModule('spk-messages', '$layouts/Messages', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky')
;

class Messages extends spocky.Layout {

    static get Content() {
        return [["div",{"_elem":["msg"],"class":["modal fade"],"tabindex":["-1"]},["div",{"class":["modal-dialog modal-dialog-scrollable"]},["div",{"class":["modal-content"]},["div",{"class":["modal-header"]},["img",{"_show":["message.image"],"class":["modal-image"],"src":["$message.image"]}],["h5",{"_show":["message.title"],"class":["modal-title"]},"$message.title"],["button",{"type":["button"],"class":["btn-close"],"data-bs-dismiss":["modal"],"aria-label":["Close"]}]],["div",{"_show":["message.text"],"class":["modal-body"]},["p",{},"$message.text"]],["div",{"class":["modal-footer"]},["button",{"type":["button"],"class":["btn btn-primary"],"data-bs-dismiss":["modal"]},"$text('Close')"]]]]],["div",{"_show":["loading.show"],"class":["loader-holder"]},["div",{"class":["d-flex align-items-center"]},["div",{"class":["spinner-border me-3 text-primary"],"role":["status"],"aria-hidden":["true"]}],["strong",{},"$loading.text"]]],["div",{"_elem":["confirmation"],"class":["modal fade"],"tabindex":["-1"]},["div",{"class":["modal-dialog modal-choice"]},["div",{"class":["modal-content"]},["div",{"class":["modal-header"]},["h5",{"_show":["confirmation.title"],"class":["modal-title"]},"$confirmation.title"],["div",{"_show":["confirmation.text"],"class":["modal-body"]},["p",{},"$message.text"]],["button",{"type":["button"],"class":["btn-close"],"data-bs-dismiss":["modal"],"aria-label":["Close"]}]],["div",{"class":["modal-footer"]},["div",{"class":["row"]},["div",{"class":["col"]},["button",{"_elem":["yes"],"type":["button"],"class":["btn btn-secondary w-100"],"data-bs-dismiss":["modal"]},["i",{"class":["fa fa-check i-left"]}],"$confirmation.yes"]],["div",{"class":["col"]},["button",{"_elem":["no"],"type":["button"],"class":["btn btn-primary w-100"]},["i",{"class":["fa fa-times i-left"]}],"$confirmation.no"]]]]]]],["div",{"_elem":["notification"],"class":["notification-holder"],"style":["display: none;"]},["div",{"class":["notification-bg bg-light"]},["i",{"class":["fas ","$notification.faIcon"]}],"  ","$notification.message"]]];
    }


    constructor(defaultFieldValues = {})
    {
        js0.args(arguments, [ js0.RawObject, js0.Default ]);

        super(Messages.Content, defaultFieldValues);
    }

}


module.exports = Messages;
exports = module.exports;




 });