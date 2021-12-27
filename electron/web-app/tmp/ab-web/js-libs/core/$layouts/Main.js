jsLibs.exportModule('core', '$layouts/Main', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky')
;

class Main extends spocky.Layout {

    static get Content() {
        return [["div",{"class":["container text-center p-5"]},["$",{"_show":["?($Display === 'Start')"]},["button",{"_elem":["CreateBoulderBetasVideo"],"class":["btn btn-primary btn-lg"]},"Create Boulder Betas Video"]],["$",{"_show":["?($Display === 'BoulderBetas')"]},["button",{"_elem":["CreateClip"],"class":["btn btn-primary btn-lg"]},"Create Video"],["div",{"_elem":["BoulderBetas"],"class":["list-group"]},["div",{"_repeat":["BoulderBetas:BoulderBeta"],"class":["list-group-item"]},["div",{"class":["row"]},["div",{"class":["col float-left handle"]},["i",{"class":["fas fa-ellipsis-v float-left"]}," "]],["div",{"class":["col float-left"]},["input",{"_elem":["BoulderBeta_Name"],"type":["text"],"value":["$BoulderBeta.Name"]}]]],["div",{"class":["row"]},["div",{"class":["col"]},"$BoulderBeta.FilePath"]]]]],["$",{"_show":["?($Display === 'CreatingClip')"]},["h1",{},"Creating video..."]],["$",{"_show":["?($Display === 'ClipCreated')"]},["h3",{},"Video created."],["button",{"_elem":["CopyYTDescription"],"class":["btn btn-primary"]},"Copy YouTube Description"],["textarea",{"_elem":["YTDescription"],"class":["form-control m-2"],"rows":["10"],"style":["min-width: 100%;"]},"$YTDescription"],["p",{},"After uploading video to YouTube paste link here to create qr codes:"],["input",{"_elem":["YTLink"],"type":["text"],"class":["form-control"],"placeholder":["YouTube Link"]}],["button",{"_elem":["CreateQRCodes"],"class":["btn btn-primary"]},"Create QR Codes"]],["$",{"_show":["?($Display === 'CreatingQRCodes')"]},["h1",{},"Creating QR Codes..."]]],["$",{"_holder":["msgs"]}]];
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