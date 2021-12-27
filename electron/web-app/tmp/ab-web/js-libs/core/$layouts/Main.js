jsLibs.exportModule('core', '$layouts/Main', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky')
;

class Main extends spocky.Layout {

    static get Content() {
        return [["div",{"class":["app-holder"]},["div",{"class":["app-bg"]}],["div",{"class":["header-holder"]},["img",{"src":["../web-app/core/images/logo.png"],"alt":["Rocko Climbing"]}]],["div",{"class":["container content-holder"]},["$",{"_show":["?($Display === 'Start')"]},["button",{"_elem":["CreateBoulderBetasVideo"],"class":["btn btn-primary btn-lg"]},"Create Boulder Betas Video"],["div",{"class":["home-hint hint"]},"Welcome! Click the button above to quickly add videos. You can select more than one file."]],["$",{"_show":["?($Display === 'BoulderBetas')"]},["button",{"_elem":["CreateClip"],"class":["btn btn-primary btn-lg"]},"Create Video"],["div",{"_elem":["BoulderBetas"],"class":["list-group list-holder"]},["div",{"_repeat":["BoulderBetas:BoulderBeta"],"class":["list-group-item"]},["div",{"class":["row mb-2"]},["div",{"class":["col-auto handle"]},["div",{"class":["btn btn-light"]},["i",{"class":["fas fa-ellipsis-v"]}," "]]],["div",{"class":["col list-input"]},["input",{"_elem":["BoulderBeta_Name"],"type":["text"],"value":["$BoulderBeta.Name"],"class":["form-control"]}]]],["div",{"class":["hint hint-sm"]},"$BoulderBeta.FilePath"]]]],["$",{"_show":["?($Display === 'CreatingClip')"]},["div",{"class":["alert alert-secondary w-100"],"role":["alert"]},"Creating video..."]],["$",{"_show":["?($Display === 'ClipCreated')"]},["h3",{"class":["text-center mb-3"]},"Your video has been created!"],["button",{"_elem":["CopyYTDescription"],"class":["btn btn-secondary w-100"]},"Copy YouTube Description"],["textarea",{"_elem":["YTDescription"],"class":["form-control my-2"],"rows":["10"],"style":["min-width: 100%;"]},"$YTDescription"],["div",{"class":["hint my-2"]},"After uploading video to YouTube paste link below to create QR codes:"],["input",{"_elem":["YTLink"],"type":["text"],"class":["form-control"],"placeholder":["YouTube Link"]}],["button",{"_elem":["CreateQRCodes"],"class":["btn btn-primary btn-lg w-100 mt-2"]},"Create QR Codes"]],["$",{"_show":["?($Display === 'CreatingQRCodes')"]},["div",{"class":["alert alert-secondary w-100"],"role":["alert"]},"Creating QR Codes..."]]]],["$",{"_holder":["msgs"]}]];
    }


    constructor(defaultFieldValues = {})
    {
        js0.args(arguments, [ js0.RawObject, js0.Default ]);

        super(Main.Content, defaultFieldValues);
    }

}


module.exports = Main;
exports = module.exports;




 });