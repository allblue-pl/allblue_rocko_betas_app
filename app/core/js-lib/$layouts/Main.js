'use strict';

const
    js0 = require('js0'),
    spocky = require('spocky')
;

export default class Main extends spocky.Layout {

    static get Content() {
        return [["div",{"class":["container text-center p-5"]},["$",{"_show":["?($Display === 'Start')"]},["button",{"_elem":["CreateBoulderBetasVideo"],"class":["btn btn-primary btn-lg"]},"Create Boulder Betas Video"]],["$",{"_show":["?($Display === 'BoulderBetas')"]},["button",{"_elem":["CreateClip"],"class":["btn btn-primary btn-lg"]},"Create Video"],["hr",{}],["div",{"_elem":["BoulderBetas"],"class":["list-group"]},["div",{"_repeat":["BoulderBetas:BoulderBeta"],"class":["list-group-item"]},["input",{"type":["text"],"value":["$BoulderBeta.Name"]}],["br",{}],"$BoulderBeta.FilePath"]]],["$",{"_show":["?($Display === 'CreatingClip')"]},["h1",{},"Creating video..."]],["$",{"_show":["?($Display === 'ClipCreated')"]},["h3",{},"Video created."],["button",{"_elem":["CopyYTDescription"],"class":["btn btn-primary"]},"Copy YouTube Description"],["textarea",{"_elem":["YTDescription"],"class":["form-control m-2"],"rows":["10"],"style":["min-width: 100%;"]},"$YTDescription"],["input",{"_elem":["YTLink"],"type":["text"],"class":["form-control"]}],["button",{"_elem":["CreateQRCodes"],"placeholder":["YouTube Link"],"class":["btn btn-primary"]},"Create QR Codes"]]],["$",{"_holder":["msgs"]}]];
    }


    constructor(defaultFieldValues = {})
    {
        js0.args(arguments, [ js0.RawObject, js0.Default ]);

        super(Main.Content, defaultFieldValues);
    }

}
