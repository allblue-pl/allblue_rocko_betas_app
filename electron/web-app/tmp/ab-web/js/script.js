
// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\web-app\dev\node_modules\js-libs-web\js\js-libs.js
const jsLibs_Class = (() => { 'use strict';


class JSLibs
{

    get Require()
    { let self = this;
        return Require;
    }


    constructor()
    { let self = this;
        self._packages = {};
    }

    exists(packageName)
    {
        return packageName in self._packages;
    }

    exportModule(packageName, modulePath, moduleInitFn)
    { let self = this;
        if (!(packageName in self._packages))
            self._packages[packageName] = new Package(self, packageName);

        self._packages[packageName].addModule(modulePath, moduleInitFn);
    }

    importModule(packageName, modulePath)
    { let self = this;
        if (!(packageName in self._packages)) {
            throw new Error('Package `' + packageName + '` does not exist.');
        }

        return self._packages[packageName].importModule(modulePath);
    }

    require(packageName)
    { let self = this;
        let module = self.importModule(packageName, 'index');
        if (module === Module.DoesNotExist) {
            throw new Error('Module `' + packageName + '` (`' +
                    packageName + ':' + 'index' +
                    '`) does not exist.');
        }

        return module;
    }


    _parsePackagePath(package_path)
    { let self = this;
        return package_path;
    }

}


class Module
{

    get instanceModule()
    { let self = this;
        if (self._instanceModule === null) {
            let require = new Require(self._package.jsLibs, self._package.name,
                    self._path);
            self._instanceModule = {
                exports: {}, // Module.ExportNotImplemented,
            };

            self._initFn(require.fn, self._instanceModule, self._instanceModule.exports);

            if (self._instanceModule.exports === Module.ExportNotImplemented) {
                console.log(self._instanceModule);
                throw new Error('No `exports` found in module `' +
                        self._package.name + '/' + self._path + '`.');
            }
        }

        return self._instanceModule;
    }


    constructor(js_lib_package, modulePath, init_fn)
    { let self = this;
        self._package = js_lib_package;
        self._path = modulePath;
        self._initFn = init_fn;

        self._instanceModule = null;
    }

}
Object.defineProperties(Module, {

    DoesNotExists: { value:
    new class Module_DoesNotExist {

    }()},

    ExportNotImplemented: { value: {}, },

});


class Package
{

    constructor(jsLibs, packageName)
    { let self = this;
        self.jsLibs = jsLibs;
        self.name = packageName;

        self._modules = {};
    }

    addModule(modulePath, moduleInitFn)
    { let self = this;
        self._modules[modulePath] = new Module(self, modulePath, moduleInitFn);
    }

    importModule(modulePath)
    { let self = this;
        if (modulePath in self._modules)
            return self._modules[modulePath].instanceModule.exports;

        modulePath += '/index';
        if (modulePath in self._modules)
            return self._modules[modulePath].instanceModule.exports;

        return Module.DoesNotExist;
    }

}


class Require
{

    get fn()
    { let self = this;
        return self._fn;
    }


    constructor(jsLibs, packageName = null, current_path = null)
    { let self = this;
        self._packageName = packageName;
        self._currentPath_Array = null;

        self._fn = (import_path) => {
            let import_info = self._resolveImportInfo(import_path);

            let module = jsLibs.importModule(import_info.packageName,
                    import_info.modulePath);
            if (module === Module.DoesNotExist) {
                throw new Error('Module `' + import_path + '` (`' +
                        import_info.packageName + ':' + import_info.modulePath +
                        '`) does not exist.');
            }

            return module;
        };

        if (current_path !== null) {
            self._currentPath_Array = current_path.split('/');
            self._currentPath_Array.pop();
        }
    }


    _resolveImportInfo(import_path)
    { let self = this;
        let import_path_array = import_path.split('/');

        /* Import Package */
        if (import_path_array[0] !== '.' && import_path_array[0] !== '..') {
            return {
                packageName: import_path_array[0],
                modulePath: 'index',
            };
        }

        if (self._packageName === null)
            throw new Error('Cannot import module outside of package.');

        /* Import Module */
        let modulePath_array = self._currentPath_Array.slice();

        for (let i = 0; i < import_path_array.length; i++) {
            if (import_path_array[i] === '.')
                continue;

            if (import_path_array[i] === '..') {
                modulePath_array.pop();
                continue;
            }

            modulePath_array.push(import_path_array[i]);
        }

        if (modulePath_array.length === 0)
            modulePath_array.push('index');
        else if (modulePath_array[modulePath_array.length - 1] === '')
            modulePath_array[modulePath_array.length - 1] = 'index';

        return {
            packageName: self._packageName,
            modulePath: modulePath_array.join('/'),
        };
    }

}


return JSLibs;

})();

const jsLibs = new jsLibs_Class();
// const require = (new jsLibs.Require(jsLibs)).fn;


// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\core\Main.js
jsLibs.exportModule('core', 'Main', (require, module, exports) => { 
'use strict';

const
    electron = requireNode('electron'),
    path = requireNode('path'),

    spkMessages = require('spk-messages'),
    spocky = require('spocky'),

    $layouts = require('./$layouts')
;

class Main extends spocky.Module
{

    constructor()
    {
        super();

        this._dBoulderBetas = [];
        this._dBoulderBetas_Order = [];
        this._clipInfos = [];
        this._boulderBetas_Sortable = null;

        this.l = new $layouts.Main();

        if (BuildType === 'dev')
            electron.ipcRenderer.send('Debug_OpenConsole');

        this.msgs = new spkMessages.Messages({
            modulePath: BuildType === 'rel' ?
                    'web-app/dist/node_modules/spk-messages/' :                    
                    '../web-app/dev/node_modules/spk-messages/',
        });
        this.l.$holders.msgs.$views = this.msgs;

        this.setView_Start();

        this.l.$elems.CreateBoulderBetasVideo.addEventListener('click', (evt) => {
            evt.preventDefault();
            electron.ipcRenderer.send('BoulderBetas_SelectFiles');
        });
        electron.ipcRenderer.on('BoulderBetas_FilesSelected', (evt, filePaths) => {
            this.setView_BoulderBetas(filePaths);
        });

        this.l.$elems.CreateClip.addEventListener('click', (evt) => {
            evt.preventDefault();

            let dBoulderBetas_Sorted = [];
            for (let order of this._dBoulderBetas_Order) {
                dBoulderBetas_Sorted.push({
                    Name: this.l.$elems.$get('BoulderBeta_Name', [ order ]).value,
                    FilePath: this._dBoulderBetas[order].FilePath,
                });
            }

            electron.ipcRenderer.send('BoulderBetas_ClipLocation_Select');
        });
        electron.ipcRenderer.on('BoulderBetas_ClipLocation_Selected', 
                (evt, clipFilePath) => {
            this.setView_CreatingClip();
            electron.ipcRenderer.send('BoulderBetas_Clip_Create', 
                    this._dBoulderBetas, clipFilePath);
        });
        electron.ipcRenderer.on('BoulderBetas_Clip_Created', 
                (evt, result) => {
            this._clipInfos = result.clipInfos;
            let ytDescription = this._getYTDescription(result.clipInfos);
            this.setView_ClipCreated(ytDescription);
        });

        this.l.$elems.CopyYTDescription.addEventListener('click', (evt) => {
            evt.preventDefault();
            this.l.$elems.YTDescription.select();
            document.execCommand('copy');
        });

        this.l.$elems.CreateQRCodes.addEventListener('click', (evt) => {
            evt.preventDefault();
            let ytLink = this.l.$elems.YTLink.value;
            if (ytLink === '') {
                this.msgs.showMessage_Failure('YT Link is empty.');
                return;
            }

            electron.ipcRenderer.send('BoulderBetas_QRCodesLocation_Select', 
                    this._dBoulderBetas);
        });
        electron.ipcRenderer.on('BoulderBetas_QRCodesLocation_Selected', 
                (evt, qrCodesLocation) => {
            this.setView_CreatingQRCodes();
            
            let ytLink = this.l.$elems.YTLink.value;

            electron.ipcRenderer.send('BoulderBetas_QRCodes_Create', 
                    this._clipInfos, ytLink, qrCodesLocation);
        });
        electron.ipcRenderer.on('BoulderBetas_QRCodes_Created', 
                (evt) => {
            this.msgs.showMessage_Success('QR Codes Created', '', () => {
                this.setView_Start();
            });
        });

        this.$view = this.l;
    }

    setView_BoulderBetas(filePaths)
    {   
        this._dBoulderBetas = [];
        for (let i = 0; i < filePaths.length; i++) {
            this._dBoulderBetas.push({
                Name: path.basename(filePaths[i]).split('.').slice(0, -1).join('.'),
                FilePath: filePaths[i],
            });
            this._dBoulderBetas_Order.push(i);
        }

        this.l.$fields.BoulderBetas = this._dBoulderBetas;
        this.l.$fields.Display = 'BoulderBetas';

        this._boulderBetas_Sortable = new Sortable(this.l.$elems.BoulderBetas, {
            animation: 120,
            handle: '.handle',
            onEnd: (evt) => {
                let tempArr = this._dBoulderBetas_Order.splice(evt.oldIndex, 1);
                this._dBoulderBetas_Order.splice(evt.newIndex, 0, tempArr[0]);
            },
        });
    }

    setView_ClipCreated(ytDescription)
    {
        this.l.$fields.YTDescription = ytDescription;
        this.l.$fields.Display = 'ClipCreated';
    }

    setView_CreatingClip()
    {
        this.l.$fields.Display = 'CreatingClip';
    }

    setView_CreatingQRCodes()
    {
        this.l.$fields.Display = 'CreatingQRCodes';
    }

    setView_Start()
    {
        this._dBoulderBetas = [];
        this._dBoulderBetas_Order = [];
        this._clipInfos = [];
        this.l.$fields.BoulderBetas = [];
        this.l.$fields.Display = 'Start';

        if (this._boulderBetas_Sortable !== null)
            this._boulderBetas_Sortable.destroy();
    }


    _getFormattedTime(time) {
        let minutes = Math.floor(Math.floor(time) / 60);
        let seconds = Math.floor(time) - (minutes * 60);
    
        let seconds_Str = '00' + seconds;
        seconds_Str = seconds_Str.substr(seconds_Str.length - 2);
    
        return minutes + ':' + seconds_Str;
    }

    _getYTDescription(clipInfos) {
        /* yt */
        let ytDescription = '';
        let timeStart = 0;
        for (let i = 0; i < clipInfos.length; i++) {
            ytDescription += (i > 0 ? '\r\n' : '') + 
                    this._getFormattedTime(timeStart) + ' - ' + clipInfos[i].name;
            timeStart += clipInfos[i].duration;
        }
    
        return ytDescription;
    }

}
module.exports = Main;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\core\index.js
jsLibs.exportModule('core', 'index', (require, module, exports) => { 'use strict';

const 
    abDate = require('ab-date'),
    abNative = require('ab-native'),
    abResourcePreloader = require('ab-resource-preloader'),
    abText = require('ab-text'),
    js0 = require('js0'),
    spocky = require('spocky'),
    webABApi = require('web-ab-api'),

    // langs = require('./langs'),
    // pickardo = require('./pickardo'),

    $layouts = require('./$layouts')
;


class core_Class 
{

    get base() {
        return this._base;
    }

    get spk() {
        return this._spk;
    }


    constructor()
    {
        this._spk = new spocky.App()
            .config(($app, $cfg) => {
                $cfg
                    .container('app', require('./Main'));
            });

    }

    init(debug)
    {
        /* Spocky */
        spocky.setDebug(debug);
        webABApi.setDebug(debug);

        this._spk.init(debug);
    }

}
const app = new core_Class();



module.exports = app;


 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\core\$layouts\Main.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\core\$layouts\index.js
jsLibs.exportModule('core', '$layouts/index', (require, module, exports) => { 'use strict';

const Main = require('./Main');






module.exports.Main = Main;
 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spk-messages\index.js
jsLibs.exportModule('spk-messages', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class spkMessages_Class
{

    get Messages() {
        return require('./Messages');
    }


    constructor()
    {
        this._textFn = (text) => {
            return this._texts[text];
        };  
        this._texts = {
            Close: 'Close',
        };
    }

    setTextFn(textFn)
    {
        js0.args(arguments, 'function');

        this._textFn = textFn;
    }

    text(text)
    {
        js0.args(arguments, 'string');

        return this._textFn(text);
    }

}
const spkMessages = new spkMessages_Class();



module.exports = spkMessages;


 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spk-messages\Messages.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spk-messages\$layouts\Messages.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spk-messages\$layouts\index.js
jsLibs.exportModule('spk-messages', '$layouts/index', (require, module, exports) => { 'use strict';

const Messages = require('./Messages');






module.exports.Messages = Messages;
 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\web-ab-api\index.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\web-ab-api\Result.js
jsLibs.exportModule('web-ab-api', 'Result', (require, module, exports) => { 'use strict';


class Result
{

    static Error(message)
    {
        var result = new Result();
        result.result = 2;
        result.message = message;
        result.data = {};

        return result;
    }

    static Error_Connection(message)
    {
        var result = new Result();
        result.result = 3;
        result.message = message;
        result.data = {};

        return result;
    }

    static Parse(dataString, uri, debug = false)
    {
        var data = null;
        try {
            data = JSON.parse(dataString);
        } catch (err) {

        }

        if (data === null) {
            var result = Result.Error(
                    'Cannot parse json data from: ' + uri);
            result.data.data = dataString;

            if (debug)
                console.error(dataString);

            return result;
        }

        var result = new Result();

        if (!('result' in data)) {
            result.result = 2;
            result.message = 'No result info in json data.';
        } else {
            result.result = data.result;
            if ('message' in data)
                result.message = data.message;
            result.data = data;
        }

        return result;
    }


    constructor()
    {
        this.result = 3;
        this.message = '';
        this.data = null;
    }

    isSuccess()
    {
        return this.result === 0;
    }

    isFailure()
    {
        return this.result === 1;
    }

    isError()
    {
        return this.result === 2;
    }

    isError_Connection()
    {
        return this.result = 3;
    }
    
};
module.exports = Result;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\App.js
jsLibs.exportModule('spocky', 'App', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    // test = require('test'),

    // Config = require('./instances/Config'),
    // Layout = require('./instances/Layout'),
    // Package = require('./instances/Package'),
    // Page = require('./instances/Page'),

    AppInstance = require('./AppInstance'),
    Inits = require('./Inits'),
    Layout = require('./Layout'),
    Module = require('./Module')
;

class App
{

    constructor()
    {
        this._initialized = false;
        this._inits = new Inits();
    }

    app(appInitFn)
    {
        js0.args(arguments, 'function');

        this._inits.app.push(appInitFn);

        return this;
    }

    config(configFn)
    {
        js0.args(arguments, 'function');

        if (this._initialized)
            throw new Error('App already initialized.');

        this._inits.configs.push(configFn);

        return this;
    }

    // ext(ext_initFn)
    // {
    //     js0.args(arguments, 'function');

    //     this._infos.appInits.push({
    //         initFn:ext_initFn,
    //     });
    // }

    init()
    {
        if (this._initialized)
            throw new Error('`spocky` already initialized.');
        this._initialized = true;

        /* Config */
        new AppInstance(this._inits);

        return this;
    }

    // layout(layoutPath, layoutInitFn)
    // {
    //     js0.args(arguments, 'string', 'function');

    //     if (this._initialized)
    //         throw new Error('Cannot define layout after initialization.');

    //     if (layoutPath in this._inits.layout)
    //         throw new Error(`Layout '${layoutPath}' already exists.`);

    //     this._inits.layout[layoutPath] = layoutInitFn;
    // }

    // package(packagePath, packageInitFn)
    // {
    //     js0.args(arguments, 'string', 'function');

    //     if (this._initialized)
    //         throw new Error('Cannot define package after initialization.');

    //     if (!this._inits.package.has(packagePath))
    //         this._inits.package.set(packagePath, []);

    //     this._inits.package.get(packagePath).push(packageInitFn);
    // }


    // _layout(layoutPath, layoutInitPath, raw)
    // {
    //     js0.args(arguments, 'string', 'function', 'boolean');

    //     if (this._initialized)
    //         throw new Error('Cannot define layout after initialization.');

    //     if (layoutPath in this._infos.layouts) {
    //         if (this._$debug)
    //             console.warn('Layout `' + layoutPath + '` already exists. Overwriting.');
    //     }

    //     this._infos.layouts[layoutPath] = {
    //         raw: raw,
    //         path: layoutPath,
    //         initFn: layoutInitPath,
    //     };
    // }

    // _parseUri(uri, push_state)
    // {
    //     let page_info = this._uri.parse(uri);
    //     if (page_info === null)
    //         throw new Error(`No page matches uri \`${uri}\`.`);

    //     this._setPage(page_info.name, page_info.args, push_state);
    // }

};


module.exports = App;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\ConfigInfo.js
jsLibs.exportModule('spocky', 'ConfigInfo', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const Config = require('./Config');
const Inits = require('./Inits');


class ConfigInfo {

    constructor()
    {
        Object.defineProperties(this, {
            containerInfos: { value: new Map(), },
        });
    }

}
module.exports = ConfigInfo;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Ext.js
jsLibs.exportModule('spocky', 'Ext', (require, module, exports) => { 'use strict';


class Ext
{

    constructor()
    {

    }

    onParseLayoutNode(layoutNode)
    {
        
    }

}

module.exports = Ext;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Inits.js
jsLibs.exportModule('spocky', 'Inits', (require, module, exports) => { 'use strict';


class Inits
{

    constructor()
    {
        Object.defineProperties(this, {
            app: { value: [] },
            configs: { value: [], writable: true, },
            ext: { value: new Map(), },
            layout: { value: new Map(), },
            package: { value: new Map(), },
        });
    }

}
module.exports = Inits;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Config.js
jsLibs.exportModule('spocky', 'Config', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const ConfigInfo = require('../ConfigInfo');
const ContainerInfo = require('../ContainerInfo');
const Inits = require('../Inits');
const Module = require('../Module');


class Config
{

    constructor(configInfo)
    {
        js0.args(arguments, ConfigInfo);

        this._configInfo = configInfo;
    }

    container(htmlElementId, moduleClass, moduleArgs = [])
    {
        js0.args(arguments, 'string', 'function', [ Array, js0.Default ]);

        /* Validate HTML Element */
        let htmlElement = document.getElementById(htmlElementId);
        if (htmlElement === null)
            throw new Error(`\`HtmlElement\` with id \`${htmlElementId}\` does not exist.`);

        /* Create Container */
        let containerInfo = new ContainerInfo(htmlElementId, htmlElement,
                moduleClass, moduleArgs);

        // /* Validate Module Paths */
        // for (let modulePath of containerInfo.modulePath) {            
        //     if (!(path_configInfo.packagePath in this._infos.packages))
        //         throw new Error(`Module \`${path_configInfo.fullPath}\` package does not exist.`);
        // }

        this._configInfo.containerInfos.set(containerInfo.id, containerInfo);
        /* / Create Container */

        return this;
    }

}
module.exports = Config;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\ContainerInfo.js
jsLibs.exportModule('spocky', 'ContainerInfo', (require, module, exports) => { 'use strict';

const js0 = require('js0');

// const Module = require('../instances/Module');


class ContainerInfo
{

    constructor(containerId, htmlElement, moduleClass, moduleArgs)
    {
        js0.args(arguments, 'string', HTMLElement, 'function', Array);

        Object.defineProperties(this, {
            id: { value: containerId, },
            htmlElement: { value: htmlElement, },
            moduleClass: { value: moduleClass, },
            moduleArgs: { value: moduleArgs, },
        });
    }

}
module.exports = ContainerInfo;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Holder.js
jsLibs.exportModule('spocky', 'Holder', (require, module, exports) => { 'use strict';

const
    abLayouts = require('ab-layouts'),
    js0 = require('js0'),

    Layout = require('./Layout'),
    Module = require('./Module')
;

class Holder
{

    get $view() {
        if (this._view === null)
            return null;
        
        return this._view;
    }
    set $view(value) {
        if (!js0.type(value, [ require('./Layout'), require('./Module'), js0.Null ]))
            throw new Error(`'$view' must be 'Layout', 'Module' or 'Null'.`);

        if (this._$view === null)
            return;

        if (this._view !== null)
            this._view._$viewable.deactivate();

        this._view = value;
        if (this._view !== null)
            this._view._$viewable.activate(this._layoutNode);
    }


    constructor(layoutNode)
    {
        js0.args(arguments, abLayouts.LayoutNode);

        Object.defineProperties(this, {
            _layoutNode: { value: layoutNode, },
            _view: { value: null, writable: true, },
        });
    }

    // _$activate()
    // {
    //     if (this._view !== null)
    //         this._view._$viewable.activate(this._layoutNode);
    // }

}
module.exports = Holder;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\AppInstance.js
jsLibs.exportModule('spocky', 'AppInstance', (require, module, exports) => { 'use strict';

const 
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    Config = require('./Config'),
    ConfigInfo = require('./ConfigInfo'),
    Inits = require('./Inits'),
    Layout = require('./Layout'),
    Module = require('./Module'),
    PathInfo = require('./PathInfo')
;

class AppInstance
{

    constructor(inits)
    {
        js0.args(arguments, Inits);

        let config = new ConfigInfo();

        Object.defineProperties(this, {
            _config: { value: new ConfigInfo(), },
            _inits: { value: inits, },
            // _jsLibs: { value: new jsLibs_Class(), },
            _jsLibs: { value: jsLibs, },
        });

        /* Confit Init */
        let cfg = new Config(this._config);
        for (let configFn of this._inits.configs)
            configFn(this, cfg);

        /* App Inits */
        for (let initFn of this._inits.app)
            initFn(this);

        /* Containers Init */
        for (let [ containerId, containerInfo ] of this._config.containerInfos) {
            let rootNode = new abNodes.RootNode(containerInfo.htmlElement);
            
            let moduleArgs = [ null ];
            for (let arg of containerInfo.moduleArgs)
                moduleArgs.push(arg);
            let module = new (Function.prototype.bind.apply(
                    containerInfo.moduleClass, moduleArgs));            
            if (!(module instanceof Module))
                throw new Error(`Containers '${containerId}' class is not a Spocky module.`);

            rootNode.activate();
            module._$viewable.activate(rootNode);
        }
    }

    // $create(fullCreatePath)
    // {
    //     let createPathInfo = new PathInfo(fullCreatePath);

    //     let pkg = this.$import(createPathInfo.packagePath);

    //     return pkg.$create(createPathInfo.name);
    // }

}


module.exports = AppInstance;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Layout.js
jsLibs.exportModule('spocky', 'Layout', (require, module, exports) => { 'use strict';

const 
    abTextParser = require('ab-text-parser'),
    js0 = require('js0'),

    LayoutParser = require('./LayoutParser'),
    Viewable = require('./Viewable')
;

class Layout
{

    static Replace(layoutContent, replaceArr)
    {
        js0.args(arguments, Array, Array);

        Layout._Replace_ReplaceInArray(layoutContent, replaceArr);
    }

    static _Replace_ReplaceInArray(array, replaceArr)
    {
        for (let i = 0; i < array.length; i++) {
            if (typeof array[i] === 'string') {
                let newString = array[i];
                for (let replace of replaceArr) {
                    newString = newString.replace(new RegExp(replace[0], 'g'), 
                            replace[1]);
                }
        
                let newStringArr = abTextParser.parse(newString);

                array.splice(i, 1);
                for (let j = 0; j < newStringArr.length; j++)
                    array.splice(i + j, 0, newStringArr[j]);
        
                i += newStringArr.length - 1;
            } else if (js0.type(array[i], Array))
                Layout._Replace_ReplaceInArray(array[i], replaceArr);
            else if (js0.type(array[i], js0.RawObject))
                Layout._Replace_ReplaceInObject(array[i], replaceArr);
        }
    }

    static _Replace_ReplaceInObject(object, replaceArr)
    {
        for (let key in object) {
            if (js0.type(object[key], 'string')) {
                let newString = object[key];
                for (let replace of replaceArr) {
                    newString = newString.replace(new RegExp(replace[0], 'g'), 
                            replace[1]);
                }

                object[key] = newString;
            } else if (js0.type(object[key], Array))
                Layout._Replace_ReplaceInArray(object[key], replaceArr);
            else if (js0.type(object[key], js0.RawObject))
                Layout._Replace_ReplaceInObject(object[key], replaceArr);
        }
    }


    constructor(layoutContent, defaultFieldValues = {})
    {
        js0.args(arguments, Array, [ js0.RawObject, js0.Default ]);
        js0.prop(this, Layout.Viewable, this);

        let layoutParser = new LayoutParser();
        for (let ext of Layout.Extensions)
            layoutParser.extend(ext);
        let layoutNode = layoutParser.parse(layoutContent);        

        this._fields = layoutParser.fields;
        this._$data = layoutParser.data;
        this._$elems = layoutParser.elems;
        this._$holders = layoutParser.holders;

        Object.defineProperties(this, {
            $fields: {
                get: () => {
                    return this._fields.$value;
                },
                set: (value) => {
                    this._fields.$value = value;
                },
            },

            $data: { value: this._$data, },
            $elems: { value: this._$elems, },
            $holders: { value: this._$holders, },

            _$layoutNode: { value: layoutNode, },

            _$listeners_OnDisplay: { value: [], },
        });

        layoutNode.addListener_OnDisplay((display) => {
            for (let listener of this._$listeners_OnDisplay)
                listener(display);
        });

        for (let fieldName in defaultFieldValues) {
            this.$fields[fieldName] = defaultFieldValues[fieldName];
        }
    }

    $onDisplay(listener)
    {
        if (this._$viewable.active)
            listener();
        this._$listeners_OnDisplay.push(listener);
    }

}
module.exports = Layout;


Object.defineProperties(Layout, {

    Extensions: { value: [], },

    Viewable: { value:
    class Layout_Viewable extends Viewable {

        constructor(layout)
        { super();
            this._layout = layout;
        }

        __activate(parentNode)
        {
            parentNode.pChildren.add(this._layout._$layoutNode);
            // console.log('Adding child:', this._layout._$layoutNode, 'to', parentNode);
            // this._layout._$layoutNode.activate();
        }

        __deactivate(parentNode)
        {
            parentNode.pChildren.remove(this._layout._$layoutNode);
            // this._layout._$layoutNode.deactivate();
        }

    }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\LayoutParser.FieldInfo.js
jsLibs.exportModule('spocky', 'LayoutParser.FieldInfo', (require, module, exports) => { 'use strict';

const
    abFields = require('ab-fields'),
    abStrings = require('ab-strings'),
    js0 = require('js0'),

    spocky = require('.')
;

class FieldInfo
{

    static get Types() {
        return Types;
    }


    constructor(fieldsHelper, repeatInfo, fieldPath, includesPrefix)
    {
        js0.args(arguments, require('./LayoutParser.FieldsHelper'), 
                require('./LayoutParser.RepeatInfo'), 
                'string', 'boolean');

        this.fieldsHelper = fieldsHelper;
        this.repeatInfo = repeatInfo;

        this.fieldDefinitions = [];

        this.repeatInfo = this.repeatInfo;

        this.type = null;
        /* Field */
        this.field_Path = null;
        this.field_Parts = null;
        this.field_Name = null;
        /* Field Fn */
        this.fieldFn_ArgFields = null;
        this.fieldFn_ArgFieldsStr = null;
        /* Expr */
        this.expr = null;
        this.expr_ArgFields = null;

        if (this.fieldsHelper.isExpression(fieldPath)) {
            this.type = Types.Expression;

            this.expr = fieldPath.substr(2, fieldPath.length - 3);
            this.expr_ArgFields = [];
            let re = new RegExp('\\${(' + this.fieldsHelper.regexpStrs_FieldName + ')}' +
                    '|' + '\\$(' + this.fieldsHelper.regexpStrs_FieldName + ')', 'gi');
            let matches = this.expr.matchAll(re);
            for (let match of matches) {
                let fieldMatch = null;
                if (typeof match[1] !== 'undefined') {
                    fieldMatch = match[1];
                } else {
                    fieldMatch = match[5];
                }

                let expr_ArgFieldInfo = this.fieldsHelper.def(repeatInfo, fieldMatch, 
                        false, abFields.VarDefinition);

                this.expr_ArgFields.push({
                    path: fieldMatch,
                    fieldInfo: expr_ArgFieldInfo,
                });
                
                for (let expr_ArgFieldInfo_FD of expr_ArgFieldInfo.fieldDefinitions)
                    this.fieldDefinitions.push(expr_ArgFieldInfo_FD);
            }
        } else if (this.fieldsHelper.isFieldName(fieldPath, includesPrefix)) {
            fieldPath = this.fieldsHelper.getFieldName(fieldPath, includesPrefix);

            let fieldMatch = this.fieldsHelper.matchField(fieldPath);
            if (typeof fieldMatch[3] === 'undefined') {
                this.type = Types.Field;
            } else {
                this.type = Types.Function;

                this.fieldFn_ArgFields = [];
                this.fieldFn_ArgStrs = fieldMatch[3].split(',');
                for (let argStr of this.fieldFn_ArgStrs) {
                    let re = new RegExp('\\$' + this.fieldsHelper.regexpStrs_FieldName, 'g');
                    let matches = argStr.matchAll(re);
                    for (let match of matches) {
                        let fieldFn_ArgFieldInfo = this.fieldsHelper.def(repeatInfo, match[1], 
                                false, abFields.VarDefinition);
        
                        this.fieldFn_ArgFields.push({
                            path: match[1],
                            fieldInfo: fieldFn_ArgFieldInfo,
                        });

                        for (let fieldFn_ArgFieldInfo_FD of fieldFn_ArgFieldInfo.fieldDefinitions)
                            this.fieldDefinitions.push(fieldFn_ArgFieldInfo_FD);
                    }
                }
            }

            this.field_Parts = fieldMatch[1];
            this.field_Parts = this.field_Parts.split('.');
            this.field_Name = this.field_Parts[this.field_Parts.length - 1];
        } else
            throw new Error(`Unknown 'FieldInfo' type of: ` + fieldPath);
    }

    getEval($evalStr, $argFields, $fields, $keys)
    {
        // return eval($evalStr);
        return Function('"use strict";return function($argFields, $fields, $keys) {' + 
                'return ' + $evalStr + '}')()($argFields, $fields, $keys);
    }

    getEvalStr(evalStr, argFields, fields, keys)
    {
        for (let argIndex = 0; argIndex < argFields.length; argIndex++) {
            let value = `$argFields[${argIndex}].fieldInfo.getValue($fields, $keys)`;
            evalStr = evalStr.replace(new RegExp('\\$\\{' + 
                    abStrings.escapeRegExpChars(argFields[argIndex].path) + '\\}' +
                    '([^a-zA-Z0-9]|$)', 'g'), value + '$1');
            evalStr = evalStr.replace(new RegExp('\\$' + 
                    abStrings.escapeRegExpChars(argFields[argIndex].path) + 
                    '([^a-zA-Z0-9]|$)', 'g'), value + '$1');
        }

        return evalStr.replace(/([^a-zA-Z0-9]|^)this([^a-zA-Z0-9]|$)/g, '$1undefined$2');
    }
    
    getValue(fields, keys, valueType)
    {
        if (this.type === Types.Field) {
            let field = this.getField(fields, keys);
            if (field === null)
                return undefined;

            return field.$value;
        } else if (this.type === Types.Function) {
            let field = this.getField(fields, keys);
            if (field === null)
                return undefined;
                
            let fnVal = field.$value;
            if (fnVal === null || typeof fnVal === 'undefined')
                return undefined;

            let argsArr = [];
            for (let argStr of this.fieldFn_ArgStrs) {
                // console.log(new Error());
                let evalStr = this.getEvalStr(argStr, this.fieldFn_ArgFields, 
                        fields, keys);
                try {
                    argsArr.push(this.getEval(evalStr, this.fieldFn_ArgFields, fields, keys));
                } catch (err) {
                    throw new Error(`Error evaluating function '$${this.field_Parts}(${argStr})` +  
                            err);
                }            
                
            }

            return fnVal.apply(null, argsArr);
            // let evalStr_Original = `(${fnVal})(${this.fieldFn_ArgFieldsStr})`;
            // let evalStr = this.getEvalStr(this.fieldFn_ArgFieldsStr,
            //         this.fieldFn_ArgFields, fields, keys);
            // evalStr = `(${fnVal})(${evalStr})`;

            // try {
            //     return this.getEval(evalStr);
            // } catch (err) {
            //     throw new Error(`Error evaluating function '$${this.field_Parts}:${evalStr_Original}': ` +  
            //             err);
            // }    
        } else if (this.type === Types.Expression) {
            let evalStr = this.getEvalStr(this.expr, this.expr_ArgFields, fields, keys);

            try {
                return this.getEval(evalStr, this.expr_ArgFields, fields, keys);
            } catch (err) {
                if (spocky.Debug)
                    console.error(evalStr);
                throw new Error(`Error evaluating expression "${this.expr}": ` + err);
            }
        } else
            throw new Error(`Unknown 'FieldInfo' type.`);
    }

    getField(fields, keys)
    {
        js0.args(arguments, [ abFields.ObjectField, js0.Null], Array);

        let rawParts = this.getRawParts(this.repeatInfo);
        // keys = this.repeatInfo.getKeys(this, keys);

        let keysOffset = 0;
        let field = fields;
        let fieldPath = '';
        let repeatsOffset = 0;
        for (let part of rawParts) {
            if (field instanceof abFields.ObjectField) {
                field = field.$get(part);
                fieldPath += (fieldPath !== '' ? '.' : '') + part;
            }

            while (field instanceof abFields.ListField) {
                let repeatFound = false;
                for (let i = repeatsOffset; i < this.repeatInfo.repeats.length; i++) {
                    if (fieldPath === this.repeatInfo.repeats[i].fieldInfo.getFullPath(
                            this.repeatInfo)) {
                        if (keys[i] === null || typeof keys[i] === 'undefined')
                            throw new Error('Instance keys to lists inconsistency.');

                        field = field.$get(keys[i]);
                        repeatsOffset = i + 1;
                        repeatFound = true;
                        break;
                    }
                }

                if (!repeatFound)
                    break;
                    // throw new Error('Instance keys to lists inconsistency.');
            }
        }

        return field;
    }

    getFullPath(repeatInfo)
    {
        let rawParts = this.getRawParts(repeatInfo);
        return rawParts.join('.');
    }

    getRawParts(repeatInfo)
    {
        let rawParts = this.field_Parts.slice();

        /* Get all raw parts. */
        for (let i = repeatInfo.repeats.length - 1; i >= 0; i--) {
            if (rawParts[0] !== repeatInfo.repeats[i].itemName)
                continue;

            rawParts.splice(0, 1);
            rawParts = repeatInfo.repeats[i].fieldInfo.field_Parts.concat(rawParts);
            // rawParts.splice(0, 0, repeatInfo.repeats[i].fieldInfo.parts);
        }

        return rawParts;
    }

}


class Types
{

    static get Field()      { return 1; }
    static get Function()   { return 2; }
    static get Expression() { return 3; }

}

class ValueTypes
{

    static get Bool()       { return 1; }
    static get Function()   { return 2; }
    static get List()       { return 3; }
    static get Object()     { return 4; }
    static get Text()       { return 5; }

}

module.exports = FieldInfo;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\LayoutParser.FieldsHelper.js
jsLibs.exportModule('spocky', 'LayoutParser.FieldsHelper', (require, module, exports) => { 'use strict';

const
    abFields = require('ab-fields'),
    js0 = require('js0'),

    FieldInfo = require('./LayoutParser.FieldInfo')
;

class FieldsHelper
{

    static get Types() {
        return Types;
    }


    constructor()
    {
        this._fieldDefinitions = abFields.define();
        this._fieldInfos = [];

        this.regexpStrs_Expression = '\\?\\(((\\s|\\S)+)\\)';
        this.regexpStrs_FieldName = '([a-zA-Z][a-zA-Z0-9._]*)+?(\\((.*?)\\))?';
    }

    def(repeatInfo, fieldPath, includesPrefix, requiredFieldDefinitionClass)
    {
        js0.args(arguments, require('./LayoutParser.RepeatInfo'), 'string',
                'boolean', 'function');

        let fieldInfo = new FieldInfo(this, repeatInfo, fieldPath, includesPrefix);

        if (fieldInfo.type === FieldInfo.Types.Field) {
            fieldInfo.fieldDefinitions.push(this._define(fieldInfo, repeatInfo, 
                    requiredFieldDefinitionClass));
        } else if (fieldInfo.type === FieldInfo.Types.Function) {
            fieldInfo.fieldDefinitions.push(this._define(fieldInfo, repeatInfo, 
                    requiredFieldDefinitionClass));
        } else if (fieldInfo.type === FieldInfo.Types.Expression) {
            
        }
        
        return fieldInfo;
    }

    getFieldName(fieldPath, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (includesPrefix) {
            if (fieldPath[0] !== '$')
                return null;

            if (fieldPath[1] === '{') {
                if (fieldPath[fieldPath.length - 1] !== '}')
                    return null;

                return fieldPath.substring(2, fieldPath.length - 1);
            }

            return fieldPath.substring(1);
        }

        return fieldPath;
    }

    getType(fieldDefintion)
    {

    }

    getValue(fieldDefintion, value, keys)
    {
        let field = this.find(fieldDefintion);
        if (field === null)
            throw Error('Field not defined: ' + fieldDefintion);

        return typeof value === 'function' ? 
                eval(`value(${fieldInfo.args})`) : value;
    }

    find(fieldDefintion)
    {
        for (let field of this._fields) {
            if (field.definition === fieldDefintion)
                return field;
        }

        return null;
    }

    isFieldName(str, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (includesPrefix) {
            if (str[0] !== '$')
                return false;

            if (str[1] === '{') {
                if (str[str.length - 1] !== '}')
                    return false;

                return str.substring(2, str.length - 1)
                        .match(new RegExp(
                        '^' + this.regexpStrs_FieldName + '$')) !== null;    
            }

            return str.substring(1).match(
                    new RegExp('^' + this.regexpStrs_FieldName + '$')) !== null;
        }

        return str.match(new RegExp('^' + this.regexpStrs_FieldName + '$')) !== null;
    }

    isExpression(str)
    {
        js0.args(arguments, 'string', [ 'boolean', js0.Default ]);

        return str.match(new RegExp('^' + this.regexpStrs_Expression + '$', 'm')) !== null;
    }

    isValidString(str, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        return this.isFieldName(str, includesPrefix) || this.isExpression(str);
    }

    matchField(fieldPath)
    {
        js0.args(arguments, 'string');

        return fieldPath.match(this.regexpStrs_FieldName);
    }

    validateFieldName(fieldName, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (!this.isFieldName(fieldName, includesPrefix))
            throw new Error(`'${fieldName}' is not a valid field name.`);
    }

    validateProperty(property, includesPrefix)
    {
        js0.args(arguments, 'string', 'boolean');

        if (!this.isValidString(property, includesPrefix))
            throw new Error(`'${property}' is not a valid property.`);
    }

    _add(fieldDefintion, fieldInfo)
    {
        js0.args(arguments, abFields.Definition);

        let field = this.find(fieldDefintion);

        if (field === null)
            field = new Field(fieldDefintion);
        
        this._fields.push(field);
    }

    _define(fieldInfo, repeatInfo, newFieldDefinitionClass)
    {
        let fd = this._fieldDefinitions;
        let repeatOffset = 0;

        /* Check if is list. */
        let firstPart = fieldInfo.field_Parts[0];
        let repeatFound = false;
        for (let i = repeatInfo.repeats.length - 1; i >= repeatOffset; i--) {
            if (firstPart !== repeatInfo.repeats[i].itemName)
                continue;
            repeatFound = true;

            fd = repeatInfo.repeats[i].fieldDefinition;
            if (fieldInfo.field_Parts.length === 1)
                return fd.item(newFieldDefinitionClass);
            
            fd = fd.item(abFields.ObjectDefinition);
        }

        for (let i = repeatFound ? 1 : 0; i < fieldInfo.field_Parts.length - 1; i++) {
            let part = fieldInfo.field_Parts[i];
            fd = fd.object(part);
        }

        let lastPart = fieldInfo.field_Parts[fieldInfo.field_Parts.length - 1];

        // let field = null;
        // let fieldExists = fd.exists(lastPart);

        // let fieldIsVar = fieldExists ? 
        //         (fd.get(lastPart) instanceof abFields.VarDefinition ? true : false) : 
        //         false;
        // fieldExists = false;
        // fieldIsVar = false;

        if (newFieldDefinitionClass === abFields.ObjectDefinition)
            return fd.object(lastPart, false);
        else if (newFieldDefinitionClass === abFields.ListDefinition)
            return fd.list(lastPart, false);
        else if (newFieldDefinitionClass === abFields.VarDefinition) {
            // if (fieldExists && !fieldIsVar)
            //     return fd.get(lastPart);

            return fd.var(lastPart);
        } else
           throw new Error(`Unknown 'newFieldDefinitionClass'.`);
    }

}


class Field
{

    constructor(fieldDefintion)
    {
        this.definition = fieldDefintion;
    }

}


class Types
{

    static get Var() { return 1; }
    static get Function() { return 2; }
    static get Expression() { return 3; }

}

module.exports = FieldsHelper;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\LayoutParser.RepeatInfo.js
jsLibs.exportModule('spocky', 'LayoutParser.RepeatInfo', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    FieldInfo = require('./LayoutParser.FieldInfo')
;

class RepeatInfo
{

    constructor(elementsStack)
    {
        this.repeats = [];
        this.virtual = false;

        for (let i = 0; i < elementsStack.length; i++) {
            let element = elementsStack[i];

            if ('repeat' in element.info) {
                this.repeats.push(element.info.repeat);
                this.virtual = true;
            }
        }
    }

    // getKeys(fieldInfo, keys)
    // {
    //     let repeatKeys = [];
    //     for (let i = 0; i < this.repeats.length; i++)
    //         repeatKeys.push(null);

    //     let rawFieldParts = fieldInfo.getRawParts(this);
    //     let fullFieldPath = rawFieldParts.join('.');
    //     let keysIndex = keys.length - 1;
        
    //     for (let i = this.repeats.length - 1; i >= 0; i--) {
    //         let repeatFieldPath = this.repeats[i].fieldInfo
    //                 .getFullPath(this);
    //         if (fullFieldPath.indexOf(repeatFieldPath) === 0) {
    //             repeatKeys[i] = keys[keysIndex];
    //             keysIndex--;
    //             if (keysIndex < 0)
    //                 break;
    //             // fullFieldPath = fullFieldPath.substring(repeatFieldPath.length);
    //             // if (fullFieldPath[0] === '.')
    //             //     fullFieldPath = fullFieldPath.substring(1);
    //         }
    //     }
        
    //     return repeatKeys;
    // }

    getKeys(fieldInfos, keys)
    {
        let repeatKeys = [];
        for (let i = 0; i < this.repeats.length; i++)
            repeatKeys.push(null);

        if (keys.length === 0)
            return repeatKeys;

        let keysIndex = keys.length - 1;
        
        for (let i = this.repeats.length - 1; i >= 0; i--) {
            for (let fieldInfo of fieldInfos) {
                let rawFieldParts = fieldInfo.getRawParts(this);
                let fullFieldPath = rawFieldParts.join('.');
                
                let repeatFieldPath = this.repeats[i].fieldInfo
                        .getFullPath(this);
                if (fullFieldPath.indexOf(repeatFieldPath) === 0) {
                    repeatKeys[i] = keys[keysIndex];
                    keysIndex--;
                    if (keysIndex < 0)
                        break;
                    // fullFieldPath = fullFieldPath.substring(repeatFieldPath.length);
                    // if (fullFieldPath[0] === '.')
                    //     fullFieldPath = fullFieldPath.substring(1);
                }
            }

            if (keysIndex < 0)
                break;
        }
        
        return repeatKeys;
    }

}

module.exports = RepeatInfo;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\LayoutParser.js
jsLibs.exportModule('spocky', 'LayoutParser', (require, module, exports) => { 'use strict';

const
    abFields = require('ab-fields'),
    abLayouts = require('ab-layouts'),
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    spocky = require('.'),
    Holder = require('./Holder'),

    Elems = require('./LayoutParser.Elems'),
    FieldInfo = require('./LayoutParser.FieldInfo'),
    FieldsHelper =  require('./LayoutParser.FieldsHelper'),
    Holders = require('./LayoutParser.Holders'),
    RepeatInfo = require('./LayoutParser.RepeatInfo')
;

class LayoutParser extends abLayouts.Parser
{

    get data() {
        return this._data;
    }

    get elems() {
        return this._elems;
    }

    get fields() {
        return this._fields;
    }

    get holders() {
        return this._holders;
    }


    constructor()
    {
        super();

        this._fieldsHelper = new FieldsHelper();

        this._fields = null;        
        this._elems = new Elems();
        this._holders = new Holders();
        this._data = {};
    }


    _createContentElement(nodeInfo, elementsStack)
    {
        let node = this._createTextNode(nodeInfo.content, elementsStack);

        return new abLayouts.Parser.Element(node, node, null);
    }

    _createElement(nodeInfo, elementsStack)
    {
        let element = new abLayouts.Parser.Element(null, null, {});

        this._createElement_AddRepeat(nodeInfo, elementsStack, element);
        let tElementsStack = elementsStack.concat([ element ]);
        this._createElement_AddHide(nodeInfo, tElementsStack, element);
        this._createElement_AddShow(nodeInfo, tElementsStack, element);
        this._createElement_AddSingle(nodeInfo, tElementsStack, element);
        this._createElement_AddField(nodeInfo, tElementsStack, element);
        this._createElement_AddHolder(nodeInfo, tElementsStack, element);
        this._createElement_ParseElem(nodeInfo, tElementsStack, element);
        this._createElement_ParseData(nodeInfo, tElementsStack, element);

        return element;
    }

    _createElement_AddField(nodeInfo, elementsStack, element)
    {
        if (!('_field' in nodeInfo.attribs))
            return;
        if (nodeInfo.type === '$')
            throw new Error(`'_field' cannot be in virtual node.`);
        this._fieldsHelper.validateProperty(nodeInfo.attribs._field[0], false);

        let node = element.bottomNode;

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeInfo.attribs._field[0],
                false, abFields.VarDefinition);

        /* Default */
        node.innerHTML = fieldInfo.getValue(this._fields, []);

        /* Field Listeners */
        for (let fd of fieldInfo.fieldDefinitions) {
            fd.addListener({
                change: (value, keys) => {
                    this._runOnUIThread(() => {
                        let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                                node, keys);
                        for (let nodeInstance of nodeInstances) {
                            let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                            nodeInstance.htmlElement.innerHTML = fieldInfo.getValue(
                                    this._fields, instanceKeys);
                        }
                    });
                },
            });
        }

        /* Virtual */
        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {  
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let value = fieldInfo.getValue(this._fields, instanceKeys);

                this._runOnUIThread(() => {
                    let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                    for (let nodeInstance of nodeInstances)
                        nodeInstance.htmlElement.innerHTML = value;
                });
            });
        }
    }

    _createElement_AddHide(nodeInfo, elementsStack, element)
    {
        if (!('_hide' in nodeInfo.attribs))
            return;
            this._fieldsHelper.validateProperty(nodeInfo.attribs._hide[0], false);

        let node = new abNodes.HideNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeInfo.attribs._hide[0],
                false, abFields.VarDefinition);
    
        /* Default */
        node.hide = fieldInfo.getValue(this._fields, []) ? true : false;

        /* Field Listeners */
        for (let fd of fieldInfo.fieldDefinitions) {
            fd.addListener({
                change: (value, keys) => {
                    this._runOnUIThread(() => {
                        let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                                node, keys);
                        for (let nodeInstance of nodeInstances) {
                            let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                            nodeInstance.hide = fieldInfo.getValue(
                                    this._fields, instanceKeys) ? true : false;
                        }
                    });
                },
            });
        }

        /* Virtual */
        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let value = fieldInfo.getValue(this._fields, instanceKeys);

                this._runOnUIThread(() => {
                    let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                    for (let nodeInstance of nodeInstances)
                        nodeInstance.hide = value ? true : false;
                });
            });
        }
    }

    _createElement_AddHolder(nodeInfo, elementsStack, element)
    {
        if (!('_holder' in nodeInfo.attribs))
            return;

        let node = new abLayouts.LayoutNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);

        if (repeatInfo.virtual) {
            element.info.holders_OnCreateFn = null;
            element.info.holders_OnDestroyFn = null;

            // this._elems._declare(elemName);
            node.pCopyable.onCreate((node) => {
                let keys = node.pCopyable.getInstanceKeys();
                
                /* Virtual Node */
                if (keys.length < repeatInfo.repeats.length)
                    return;

                // this._elems._add(elemName, keys, node.htmlElement);

                if (element.info.holders_OnCreateFn !== null) {
                    element.info.holders_OnCreateFn(new Holder(node), keys);
                }
            });
            node.pCopyable.onDestroy((node) => {
                let keys = node.pCopyable.getInstanceKeys();

                // this._elems._remove(elemName, keys);

                if (element.info.holders_OnDestroyFn !== null) {
                    element.info.holders_OnDestroyFn(keys);
                }
            });

            Object.defineProperty(this._holders, nodeInfo.attribs._holder, {
                get: () => {
                    return (onCreateFn) => {
                        element.info.holders_OnCreateFn = onCreateFn;

                        this._runOnUIThread(() => {
                            let nodeInstances = node.pCopyable.getNodeCopies();
                            for (let nodeInstance of nodeInstances) {
                                let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                                onCreateFn(new Holder(nodeInstance), instanceKeys);
                            }
                        });
                    };
                }
            });
        } else {
            Object.defineProperty(this._holders, nodeInfo.attribs._holder, {
                value: new Holder(node), 
                enumerable: true,
            });
        }
    }

    _createElement_AddRepeat(nodeInfo, elementsStack, element)
    {
        if (!('_repeat' in nodeInfo.attribs))
            return;

        let repeatNameArr = nodeInfo.attribs._repeat[0].split(':');
        if (repeatNameArr.length !== 2)
            throw new Error('Repeat format must be `[fieldName]:[itemFieldName].');

        let fieldName = repeatNameArr[0];
        let itemName = repeatNameArr[1];

        this._fieldsHelper.validateFieldName(fieldName, false);
        this._fieldsHelper.validateFieldName(itemName, false);

        let node = new abNodes.RepeatNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, fieldName,
                false, abFields.ListDefinition);

        let fd = fieldInfo.fieldDefinitions[0];

        element.info.repeat = {
            node: node,
            fieldInfo: fieldInfo,
            itemName: itemName,
            fieldDefinition: fd,
        };
        
        fd.addListener({
            add: (index, key, keys) => {
                this._runOnUIThread(() => {
                    let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                            node, keys);

                    for (let nodeInstance of nodeInstances)
                        nodeInstance.addAt(index, key);
                });
            },
            delete: (key, keys) => {
                this._runOnUIThread(() => {
                    let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                            node, keys);
                    for (let nodeInstance of nodeInstances)
                        nodeInstance.delete(key);
                });
            },
        });

        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let field = fieldInfo.getField(this._fields, instanceKeys);

                this._runOnUIThread(() => {
                    let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                    for (let nodeInstance of nodeInstances) {
                        for (let [ key, value ] of field)
                            nodeInstance.add(key);
                    }
                });
            });
        }

        // if ('_id' in nodeInfo.attribs)
        //     this._nodes.set(`${nodeInfo.attribs._id}.single`, node);
    }

    _createElement_AddShow(nodeInfo, elementsStack, element)
    {
        if (!('_show' in nodeInfo.attribs))
            return;
        this._fieldsHelper.validateProperty(nodeInfo.attribs._show[0], false);

        let node = new abNodes.ShowNode();
        this._createElement_UpdateElement(element, node);

        let repeatInfo = new RepeatInfo(elementsStack);
        let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeInfo.attribs._show[0],
                false, abFields.VarDefinition);

        /* Default */
        node.show = fieldInfo.getValue(this._fields, []) ? true : false;

        /* Field Listeners */
        for (let fd of fieldInfo.fieldDefinitions) {
            fd.addListener({
                change: (value, keys) => {
                    this._runOnUIThread(() => {
                        let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                                node, keys);
                        for (let nodeInstance of nodeInstances) {
                            let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                            nodeInstance.show = fieldInfo.getValue(
                                    this._fields, instanceKeys) ? true : false;
                        }
                    });
                },
            });
        }

        /* Virtual */
        if (repeatInfo.virtual) {
            node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                /* Virtual Node */
                if (instanceKeys.length < repeatInfo.repeats.length)
                    return;

                let value = fieldInfo.getValue(this._fields, instanceKeys);

                this._runOnUIThread(() => {
                    let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                    for (let nodeInstance of nodeInstances)
                        nodeInstance.show = value ? true : false;
                });
            });
        }
    }

    _createElement_AddSingle(nodeInfo, elementsStack, element)
    {
        if (nodeInfo.type === '$')
            return;

        let repeatInfo = new RepeatInfo(elementsStack);

        let node = new abNodes.SingleNode(nodeInfo.type);
        this._createElement_UpdateElement(element, node);

        this._createElement_AddSingle_ParseAttribs(repeatInfo, node, nodeInfo.attribs);
    }

    _createElement_AddSingle_ParseAttribs(repeatInfo, node, attribs)
    {
        for (let attribName in attribs) {
            // if (attribName[0] === '$')
            //     continue;

            let attribArr = attribs[attribName];
            let attribArr_FieldInfos = [];
            for (let attribPart of attribArr) {
                if (!this._fieldsHelper.isValidString(attribPart, true)) {
                    attribArr_FieldInfos.push(null);
                    continue;
                }

                let fieldInfo = this._fieldsHelper.def(repeatInfo, attribPart,
                        true, abFields.VarDefinition);
                attribArr_FieldInfos.push(fieldInfo);

                for (let fd of fieldInfo.fieldDefinitions) {
                    fd.addListener({
                        change: (value, keys) => {
                            this._runOnUIThread(() => {
                                let nodeInstances = this._getNodeInstances(repeatInfo, 
                                        fieldInfo, node, keys);
                                for (let nodeInstance of nodeInstances) {
                                    let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                                    let attrib = this._createElement_AddSingle_GetAttrib(
                                            attribArr, attribArr_FieldInfos, instanceKeys);

                                    if (attribName in nodeInstance.htmlElement)
                                        nodeInstance.htmlElement[attribName] = attrib;
                                    else
                                        nodeInstance.htmlElement.setAttribute(attribName, attrib);
                                }
                            });
                        },
                    });
                }
            }

            /* Default */
            let attrib = this._createElement_AddSingle_GetAttrib(
                    attribArr, attribArr_FieldInfos, []);
            if (attribName in node.htmlElement)
                node.htmlElement[attribName] = attrib;
            else
                node.htmlElement.setAttribute(attribName, attrib);

            /* Virtual */
            if (repeatInfo.virtual) {
                node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                    /* Virtual Node */
                    if (instanceKeys.length < repeatInfo.repeats.length)
                        return;

                    let attrib = this._createElement_AddSingle_GetAttrib(
                            attribArr, attribArr_FieldInfos, instanceKeys);
                    if (attribName in nodeInstance.htmlElement)
                        nodeInstance.htmlElement[attribName] = attrib;
                    else
                        nodeInstance.htmlElement.setAttribute(attribName, attrib);
                });
            }
        }
    }

    _createElement_AddSingle_GetAttrib(attribArr, attribArr_FieldInfos, instanceKeys)
    {
        let attrib = '';
        for (let i = 0; i < attribArr.length; i++) {
            if (attribArr_FieldInfos[i] !== null) {
                attrib += attribArr_FieldInfos[i].getValue(this._fields, instanceKeys);
            } else
                attrib += attribArr[i];
        }

        return attrib;
    }

    _createElement_ParseData(nodeInfo, elementsStack, element)
    {
        for (let attribName in nodeInfo.attribs) {
            if (attribName.indexOf('_data-') !== 0)
                continue;

            let attribArr = nodeInfo.attribs[attribName];

            let dataName = attribName.substring(`_data-`.length);
            let data = attribArr[0].replace(/\\"/g, '"');
    
            if (!(dataName in this._data))
                this._data[dataName] = [];
    
            this._data[dataName].push(data);
        }
    }

    _createElement_ParseElem(nodeInfo, elementsStack, element)
    {
        if (!('_elem' in nodeInfo.attribs))
            return;

        let elemName = nodeInfo.attribs._elem[0];
        if (this._elems.$exists(elemName)) {
            if (spocky.Debug) {
                console.warn(`Element '${elemName}' already exist. Skipping in:`, 
                        nodeInfo, new Error());
            }

            return;
        }

        let node = element.bottomNode;

        let repeatInfo = new RepeatInfo(elementsStack);

        if (repeatInfo.virtual) {
            element.info.elems_OnCreateFn = null;
            element.info.elems_OnDestroyFn = null;

            this._elems._declare(elemName);
            node.pCopyable.onCreate((node) => {
                let keys = node.pCopyable.getInstanceKeys();

                /* Virtual Node */
                if (keys.length < repeatInfo.repeats.length)
                    return;

                this._elems._add(elemName, keys, node.htmlElement);

                if (element.info.elems_OnCreateFn !== null) {
                    element.info.elems_OnCreateFn(node.htmlElement, keys);
                }
            });
            node.pCopyable.onDestroy((node) => {
                let keys = node.pCopyable.getInstanceKeys();

                this._elems._remove(elemName, keys);

                if (element.info.elems_OnDestroyFn !== null) {
                    element.info.elems_OnDestroyFn(node.htmlElement, keys);
                }
            });

            Object.defineProperty(this._elems, nodeInfo.attribs._elem, {
                get: () => {
                    return (onCreateFn) => {
                        element.info.elems_OnCreateFn = onCreateFn;
                        
                        this._runOnUIThread(() => {
                            let nodeInstances = node.pCopyable.getNodeCopies();
                            for (let nodeInstance of nodeInstances) {
                                let instanceKeys = nodeInstance.pCopyable.getInstanceKeys();
                                onCreateFn(nodeInstance.htmlElement, instanceKeys);
                            }
                        });
                    };
                }
            });
        } else {
            this._elems._declare(elemName);
            this._elems._add(elemName, [], node.htmlElement);

            Object.defineProperty(this._elems, nodeInfo.attribs._elem, {
                get: () => {
                    return node.htmlElement;
                }
            });
        }
    }

    _createElement_UpdateElement(element, new_bottom_node)
    {
        if (element.topNode === null)
            element.topNode = new_bottom_node;
        if (element.bottomNode !== null)
            element.bottomNode.pChildren.add(new_bottom_node);
        element.bottomNode = new_bottom_node;
    }

    _createTextNode(nodeContent, elementsStack)
    {
        let node = null;

        if (this._fieldsHelper.isValidString(nodeContent, true)) {
            let repeatInfo = new RepeatInfo(elementsStack);
            let fieldInfo = this._fieldsHelper.def(repeatInfo, nodeContent,
                    true, abFields.VarDefinition);
            
            node = new abNodes.TextNode(fieldInfo.getValue(this._fields, []));

            for (let fd of fieldInfo.fieldDefinitions) {
                fd.addListener({
                    change: (value, keys) => {
                        this._runOnUIThread(() => {
                            let nodeInstances = this._getNodeInstances(repeatInfo, fieldInfo, 
                                    node, keys);

                            for (let nodeInstance of nodeInstances) {
                                nodeInstance.text = fieldInfo.getValue(this._fields, 
                                        nodeInstance.pCopyable.getInstanceKeys());
                            }
                        });
                    },
                });
            }

            if (repeatInfo.virtual) {
                node.pCopyable.onCreate((nodeInstance, instanceKeys) => {
                    /* Virtual Node */
                    if (instanceKeys.length < repeatInfo.repeats.length)
                        return;

                    let value = fieldInfo.getValue(this._fields, instanceKeys);

                    this._runOnUIThread(() => {
                        let nodeInstances = node.pCopyable.getNodeCopies(instanceKeys);
                        for (let nodeInstance of nodeInstances)
                            nodeInstance.text = value;
                    });
                });
            }
        } else
            node = new abNodes.TextNode(nodeContent);

        return node;
    }

    _getNodeInstances(repeatInfo, fieldInfo, node, keys)
    {
        if (repeatInfo.repeats.length === 0)
            return [ node ];

        let fieldInfos_Requested = [];

        /* Main Field */
        if (fieldInfo.type === FieldInfo.Types.Field || 
                fieldInfo.type === FieldInfo.Types.Function)
            fieldInfos_Requested.push(fieldInfo);
        
        /* Arg Fields */
        if (fieldInfo.type === FieldInfo.Types.Function) {
            for (let argField of fieldInfo.fieldFn_ArgFields)
                fieldInfos_Requested.push(argField.fieldInfo);
        }

        if (fieldInfo.type === FieldInfo.Types.Expression) {
            for (let argField of fieldInfo.expr_ArgFields)
                fieldInfos_Requested.push(argField.fieldInfo);
        }

        /* Node Copies */
        // console.log('###', fieldInfos_Requested);
        // let nodeCopies = [];
        // for (let fieldInfo_Requested of fieldInfos_Requested) {
        //     let repeatKeys = repeatInfo.getKeys(fieldInfo_Requested, keys);
        //     console.log('Here', repeatKeys);
        //     let nodeCopies_T = node.pCopyable.getNodeCopies(repeatKeys);
        //     console.log(nodeCopies_T);
        //     for (let nodeCopy_T of nodeCopies_T) {
        //         if (!nodeCopies.includes(nodeCopy_T))
        //             nodeCopies.push(nodeCopy_T);
        //     }
        // }

        let nodeCopies = [];
        let repeatKeys = repeatInfo.getKeys(fieldInfos_Requested, keys);
        let nodeCopies_T = node.pCopyable.getNodeCopies(repeatKeys);
        for (let nodeCopy_T of nodeCopies_T) {
            if (!nodeCopies.includes(nodeCopy_T))
                nodeCopies.push(nodeCopy_T);
        }

        return nodeCopies;
    }

    _isVirtual(elementsStack)
    {
        for (let i = 0; i < elementsStack.length; i++) {
            if ('repeat' in elementsStack[i].info)
                return true;
        }

        return false;
    }

    _runOnUIThread(fn)
    {
        fn();
        // setTimeout(fn, 10);
    }


    /* abLayouts.Parser Overrides */
    __afterParse()
    {
        this._fields = this._fieldsHelper._fieldDefinitions.create();
    }
    
    __createElement(nodeInfo, elementsStack)
    {
        if (nodeInfo.type === '_content')
            return this._createContentElement(nodeInfo, elementsStack);
        else
            return this._createElement(nodeInfo, elementsStack);
    }
    /* abLayouts.Parser Overrides */

}

module.exports = LayoutParser;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Module.js
jsLibs.exportModule('spocky', 'Module', (require, module, exports) => { 'use strict';

const
    abLayouts = require('ab-layouts'),
    abNodes = require('ab-nodes'),
    js0 = require('js0'),

    Layout = require('./Layout'),
    Viewable = require('./Viewable')
;

class Module
{

    get $name() {
        return this.constructor.name;
    }

    set $view(value) {
        if (!js0.type(value, [ require('./Layout'), require('./Module'), js0.Null ]))
            throw new Error(`'$view' must be 'Layout', 'Module' or 'Null'.`);

        if (this._$view === value)
            return;

        if (this._$view !== null)
            this._$view._$viewable.deactivate();

        this._$view = value;
        if (this._$view !== null && this._$parentNode !== null)
            this._$view._$viewable.activate(this._$parentNode);
    }


    constructor()
    {
        js0.prop(this, Module.Viewable, this);

        Object.defineProperties(this, {
            _$view: { value: null, writable: true, },
            _$parentNode: { value: null, writable: true, },

            _$listeners: { value: {
                onActivate: [],
                onDeactivate: [],
            }},
        });
    }

    $onActivate(listener)
    {
        this._$listeners.onActivate.push(listener);
    }

    $onDeactivate(listener)
    {
        this._$listeners.onDeactivate.push(listener);
    }

}
module.exports = Module;


Object.defineProperties(Module, {

    Viewable: { value:
    class Module_Viewable extends Viewable {

        constructor(module)
        { super()
            js0.args(arguments, Module);

            this._module = module;
            this._onDisplay = (displayed) => {
                for (let listener of this._module._$listeners.onDisplay)
                    listener(displayed);
            };
        }

        __activate(parentNode)
        {
            this._module._$parentNode = parentNode;
            // console.log(parentNode, 'Added listener.');

            if (this._module._$view === null) {
                // Do nothing.
            } else if (js0.type(this._module._$view, js0.Prop(Viewable)))
                this._module._$view._$viewable.activate(parentNode);
            else
                js0.assert(`Unknown view type.`);

            for (let listener of this._module._$listeners.onActivate)
                listener();
        }

        __deactivate(parentNode)
        {
            for (let listener of this._module._$listeners.onDeactivate)
                listener();

            if (this._module._$view === null)
                return;
            else if (js0.type(this._module._$view, js0.Prop(Viewable)))
                this._module._$view._$viewable.deactivate();
            else
                js0.assert(`Unknown view type.`);

            this._module._$parentNode = null;
        }

    }},

});





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\Viewable.js
jsLibs.exportModule('spocky', 'Viewable', (require, module, exports) => { 'use strict';

const 
    abNodes = require('ab-nodes'),
    js0 = require('js0')
;

class Viewable
{

    static get Property() {
        return '_$viewable';
    }


    get active() {
        return this._active;
    }

    get displayed() {
        return this._displayed;
    }


    constructor()
    {
        Object.defineProperties(this, {
            _parentNode: { value: null, writable: true, },
            _active: { value: false, writable: true, },
            _displayed: { value: false, writable: true, },
        });
    }

    activate(parentNode)
    {
        js0.args(arguments, abNodes.Node);

        // setTimeout(() => {
            if (!js0.type(parentNode, js0.Prop(abNodes.Node.PChildren)))
                throw new Error(`'parentNode' does not have 'PChildren' property.`);

            if (this._parentNode !== null)
                this.deactivate();

            this._parentNode = parentNode;
            this.__activate(this._parentNode);
        // }, 10);

        this._active = true;
    }

    deactivate()
    {
        // setTimeout(() => {
            if (this._parentNode !== null) {
                this.__deactivate(this._parentNode);
                this._parentNode = null;
            }
        // }, 10);

        this._active = false;
    }

    
    // _setParentNode(parentNode) {
    //     js0.args(arguments, abNodes.Node);

    //     if (!js0.type(parentNode, js0.Prop(abNodes.Node.PChildren)))
    //         throw new Error(`'parentNode' does not have 'PChildren' property.`);

    //     if (this._parentNode !== null && this._active)
    //         this.deactivate();

    //     this._parentNode = parentNode;
    //     if (this._active)
    //         this.activate();
    // }


    __activate(parentNode) { js0.virtual(this); }
    __deactivate(parentNode) { js0.virtual(this); }

    // activate(parentNode)
    // {
    //     js0.args(arguments, abNodes.Node);
    //     if (!js0.type(parentNode, js0.Prop(abNodes.Node.PChildren)))
    //         throw new Error(`'parentNode' does not have 'PChildren' property.`);

    //     if (!this._parentNode !== null)
    //         this.deactivate();

    //     this._parentNode = parentNode;
    //     this._parentNode.pChildren.add(this.getNode());
    // }

    // deactivate(parentNode)
    // {
    //     if (this._parentNode !== null)
    //         this._parentNode.pChildren.remove(this.getNode());
    // }

    // getNode() { throw new js0.virtual(this); }

    // static Validate(object)
    // {
    //     if (typeof object !== '[object Object]')
    //         return false;
    //     if (!('viewable' in object))
    //         return false;
    //     if (!(object.viewable instanceof Viewable))
    //         return false;
    //
    //     return true;
    // }

}
module.exports = Viewable;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\LayoutParser.Elems.js
jsLibs.exportModule('spocky', 'LayoutParser.Elems', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Elems {

    constructor() {
        this._elemInfos = {};
    }

    $exists(elemName) {
        js0.args(arguments, 'string');

        return elemName in this._elemInfos;
    }

    $get(elemName, keys) {
        js0.args(arguments, 'string', Array);

        if (!(elemName in this._elemInfos))
            throw new Error(`Elem '${elemName}' does not exist.`);

        return this._get(elemName, keys);
    }

    $index(elemName, keys)
    {
        js0.args(arguments, 'string', Array);

        let keySets = this.$keys();
        for (let i = 0; i < keySets.length; i++) {
            if (this._keysMatch(keySets[i], keys))
                return i;
        }

        return -1;
    }

    $keys(elemName) {
        js0.args(arguments, 'string');

        if (!this.$exists(elemName))
            throw new Error(`Elem '${elemName}' does not exist.`);

        let keys = [];
        for (let elemInfo of this._elemInfos[elemName]) {
            let keysArr = [];
            for (let key of elemInfo.keys)
                keysArr.push(key);
            keys.push(keysArr);
        }

        return keys;
    }

    _add(elemName, keys, elem) {
        this._elemInfos[elemName].push({
            elem: elem,
            keys: keys,
        });
    }

    _declare(elemName) {
        this._elemInfos[elemName] = [];
    }

    _get(elemName, keys) {
        for (let elemInfo of this._elemInfos[elemName]) {
            if (this._keysMatch(elemInfo.keys, keys))
                return elemInfo.elem;
        }

        throw new Error(`Elem '${elemName}' with keys '` + keys.join(', ') +
            `' does not exist.`);
    }

    _keysMatch(keysA, keysB) {
        if (keysA.length !== keysB.length)
            return false;

        for (let i = 0; i < keysA.length; i++) {
            if (keysA[i] !== keysB[i])
                return false;
        }

        return true;
    }

    _remove(elemName, keys) {
        if (!this.$exists(elemName))
            throw new Error(`Elem '${elemName}' does not exist.`);

        for (let i = 0; i < this._elemInfos[elemName].length; i++) {
            if (this._keysMatch(this._elemInfos[elemName][i].keys, keys)) {
                this._elemInfos[elemName].splice(i, 1);
                return;
            }
        }

        let keysStr = keys.join(', ');
        throw new Error(`Elem '${elemName}' with keys '${keysStr}' does not exist.`);
    }
}

module.exports = Elems;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\LayoutParser.Holders.js
jsLibs.exportModule('spocky', 'LayoutParser.Holders', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Holders
{

    constructor()
    {
        
    }

}

module.exports = Holders;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\index.js
jsLibs.exportModule('spocky', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    abFields = require('ab-fields'),
    abNodes = require('ab-nodes')
;

const App = require('./App');
const Ext = require('./Ext');
const Holder = require('./Holder');
const Layout = require('./Layout');
const Module = require('./Module');
const Viewable = require('./Viewable');


const exts = [];

function ext(spockyExt) {
    js0.args(arguments, Ext);

    Layout.Extensions.push((layoutNode) => {
        spockyExt.onParseLayoutNode(layoutNode);
    });
}


let Debug = false;
function setDebug(debug) {
    exports.Debug = debug;
    abFields.setDebug(debug);
    abNodes.setDebug(debug);
};





module.exports.App = App;
module.exports.Ext = Ext;
module.exports.Holder = Holder;
module.exports.Layout = Layout;
module.exports.Module = Module;
module.exports.Viewable = Viewable;
module.exports.ext = ext;
module.exports.Debug = Debug;
module.exports.setDebug = setDebug;
 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\spocky\PathInfo.js
jsLibs.exportModule('spocky', 'PathInfo', (require, module, exports) => { 'use strict';

class PathInfo {

    constructor(importPath)
    {
        let separatorIndex = importPath.lastIndexOf('.');
        let packagePath = importPath.substring(0, separatorIndex);
        let name = importPath.substring(separatorIndex + 1);

        Object.defineProperties(this, {
            path: { value: importPath, },
            name: { value: name, },
            packagePath: { value: packagePath, },
        });
    }

}
module.exports = PathInfo





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\Parser.js
jsLibs.exportModule('ab-text-parser', 'Parser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Parser
{

    constructor(text)
    {
        js0.args(arguments, require('./Text'));

        this.text = text;
    }

    error(message, line)
    {
        throw new Error('Line: ' + line + '. ' + message);
    }

    finish()
    {
        this.text.finishParser(this);
    }

    read(c, i, line)
    {
        return this.__read(c, i, line);
    }


    __check(c, i, line) { js0.virtual(this); }
    __read(c, i, line) { js0.virtual(this); }

}
module.exports = Parser;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\Text.js
jsLibs.exportModule('ab-text-parser', 'Text', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    TextParser = require('./parsers/TextParser')
;

class Text
{

    constructor(content)
    {
        this.content = content;
        this.parsers = [
            new TextParser(this),
        ];

        this.parts = [];

        if (content !== '')
            this.parse();
    }

    addPart(part)
    {
        js0.args(arguments, 'string');

        this.parts.push(part);
    }

    error(message, line)
    {
        throw new Error('Line: ' + line + '. ' + message);
    }

    finishParser(parser)
    {
        js0.args(arguments, require('./Parser'));

        this.parsers.pop();
    }

    parse()
    {
        let i = 0;
        let line = 1;
        while(true) {
            let c = this.content[i];
            let step = 0;

            let activeParser = this.parsers[this.parsers.length - 1];
            step = activeParser.read(c, i, line);
            
            if (step === 0 && this.parsers[this.parsers.length - 1] === activeParser)
                throw new Error(`Parser '${activeParser.constructor.name}' with step 0 created infinite loop.`);

            i += step;
            if (c === '\n')
                line++;

            if (i >= this.content.length)
                break;
        }

        // if (this.parts.length > 1)
        //     throw new Error(`Part '${this.parts[this.elems.length - 1].name}' not closed.`);
    }

    startParser(parser)
    {
        js0.args(arguments, require('./Parser'));

        this.parsers.push(parser);
    }

}
module.exports = Text;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\parsers\FieldArgsParser.js
jsLibs.exportModule('ab-text-parser', 'parsers/FieldArgsParser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Parser = require('../Parser')
;

class FieldArgsParser extends Parser
{

    static IsStart(c, i, line) {
        return c === '(' ? 1 : 0;
    }


    constructor(text, fieldParser)
    {
        js0.args(arguments, require('../Text'), require('./FieldParser'));
        super(text);

        this.fieldParser = fieldParser;

        this.args = '';
    }

    __read(c, i, line)
    {
        let step;

        if (c === ')') {
            this.fieldParser.args = this.args;
            this.finish();

            if (i + 1 >= this.text.content.length && !this.fieldParser.escaped) {
                if (this.name !== '') {
                    this.fieldParser.finish();
                    this.fieldParser.addField();
                }
            }

            return 1;
        }

        this.args +=c;
        return 1;
    }

}
module.exports = FieldArgsParser;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\index.js
jsLibs.exportModule('ab-text-parser', 'index', (require, module, exports) => { 'use strict';

class abTextParser_Class
{

    constructor()
    {

    }

    parse(text)
    {
        let
            Text = require('./Text')
        ;

        let t = new Text(text);

        return t.parts;
    }

}
module.exports = new abTextParser_Class();





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\parsers\ExprParser.js
jsLibs.exportModule('ab-text-parser', 'parsers/ExprParser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Parser = require('../Parser')
;

class ExprParser extends Parser
{

    static IsStart(content, i)
    {
        if (content.length > i + 1) {
            if (content[i] !== '?')
                return 0;
            if (content[i + 1] !== '(')
                return 0;
            if (content[i - 1] === '\\')
                return 0;

            return 2;
        }

        return 0;
    }


    constructor(text, parser)
    {
        js0.args(arguments, require('../Text'), require('../Parser'));
        super(text);

        this.parentParser = parser;
        this.parentParser_Type = null;
        if (js0.type(parser, require('./TextParser')))
            this.parentParser_Type = 'text';
        else if (js0.type(parser, require('./AttribValueParser')))
            this.parentParser_Type = 'attrib'; 

        js0.assert(this.parentParser_Type !== null, 
                `Invalid parser type: ${parser.constructor.name}.`);

        this.quoteOpened = null;
        this.quotes = [ '"', '\'', '`' ];
        for (let quote in this.quotes_Opened)
            this.quotes.push(quote);

        this.bracketsOpened = 0;

        this.value = '';
    }

    __read(c, i, line)
    {
        let step;

        if (this.quoteOpened === null) {
            if (this.quotes.includes(c)) {
                this.quoteOpened = c;
                this.value += c;
                return 1;
            }
        } else {
            if (c === this.quoteOpened && this.text.content[i - 1] !== '\\') {
                this.quoteOpened = null;
                this.value += c;
                return 1;
            }
        }

        if (this.quoteOpened === null) {
            if (c === '(') {
                this.bracketsOpened++;
                this.value += c;
                return 1;
            }

            if (c === ')') {
                if (this.bracketsOpened > 0) {
                    this.bracketsOpened--;
                    this.value += c;
                    return 1;
                }

                if (this.parentParser_Type === 'text') {
                    this.text.addPart('?(' + this.value + ')');
                } else if (this.parentParser_Type === 'attrib') {
                    this.parentParser.attribParser.tagParser
                            .attribs[this.parentParser.attribParser.name].push(
                            '?(' + this.value + ')');
                }
                this.finish();
                return 1;
            }
        }

        this.value +=c;
        return 1;
    }

}
module.exports = ExprParser;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\parsers\FieldParser.js
jsLibs.exportModule('ab-text-parser', 'parsers/FieldParser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Parser = require('../Parser'),

    FieldArgsParser = require('./FieldArgsParser')
;

class FieldParser extends Parser
{

    static IsStart(document, c, i, line) {
        if (c !== '$')
            return 0;

        if (i >= 1) {
            if (document.content[i - 1] === '\\')
                return 0;
        }

        return 1;
    }


    constructor(text, parser)
    {
        js0.args(arguments, require('../Text'), require('../Parser'));
        super(text);

        this.parentParser = parser;
        this.parentParser_Type = null;
        if (js0.type(parser, require('./TextParser')))
            this.parentParser_Type = 'text';
        else if (js0.type(parser, require('./AttribValueParser')))
            this.parentParser_Type = 'attrib'; 

        js0.assert(this.parentParser_Type !== null, 
                `Invalid parser type: ${parser.constructor.name}.`);

        this.name = '';
        this.args = null;
        this.bracketsOpened = 0;

        this.escaped = false;
    
        this.regexp = /[a-zA-Z0-9_.]/;
    }

    __read(c, i, line)
    {
        let step;

        if (this.name === '' && !this.escaped) {
            if (i + 2 < this.text.content.length) {
                if (this.text.content[i + 2] === '{') {
                    this.escaped = true;
                    return 1;
                }
            }

            if (i + 1 < this.text.content.length) {
                if (this.text.content[i + 1] === '{') {
                    this.bracketsOpened++;
                    this.name += '{';
                    return 1;
                }
            }

            if (c === '{') {
                this.escaped = true;
                return 1;
            }
        }

        if (c === '{') {
            this.bracketsOpened++;
            this.name += '{';
            return 1;
        }

        if (c === '}') {
            if (this.bracketsOpened > 0) {
                this.bracketsOpened--;
                this.name += '}';
                return 1;
            }
        }

        if (this.regexp.test(c)) {
            if (this.args !== null) {
                if (this.name !== '') {
                    this.addField();
                    this.finish();
                    return 0;
                }
            }

            this.name += c;

            if (i + 1 >= this.text.content.length && !this.escaped) {
                if (this.name !== '') {
                    this.addField();
                    this.finish();
                }
            }

            return 1;
        }

        if (this.name !== '') {
            if (c === '(') {
                this.text.startParser(new FieldArgsParser(this.text, this));
                return 1;
            }
        }

        if (this.escaped) {
            if (c !== '}')
                this.error('Wrong field name format.', line);

            this.addField();

            this.finish();
            return 1;
        }

        this.addField();

        this.finish();
        return 0;
    }

    addField()
    {
        if (this.parentParser_Type === 'text') {
            this.text.addPart(this._getField());
        } else if (this.parentParser_Type === 'attrib') {
            this.parentParser.attribParser.tagParser
                    .attribs[this.parentParser.attribParser.name].push(
                    this._getField());
        }
    }


    _getField()
    {
        return '$' + (this.escaped ? '{' : '') + this.name + 
                (this.args === null ? '' : '(' + this.args + ')') + 
                (this.escaped ? '}' : '');
    }

}
module.exports = FieldParser;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text-parser\parsers\TextParser.js
jsLibs.exportModule('ab-text-parser', 'parsers/TextParser', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Parser = require('../Parser'),

    ExprParser = require('./ExprParser'),
    FieldParser = require('./FieldParser')
;

class TextParser extends Parser
{

    static IsStart(c, i, line) {
        return c === '<' ? 1 : 0;
    }


    constructor(text)
    {
        js0.args(arguments, require('../Text'));
        super(text);

        this.value = null;
        // this._htmlEntities = new htmlEntities.AllHtmlEntities();
    }

    __read(c, i, line)
    {
        let step;

        // step = TagParser.IsStart(c);
        // if (step > 0) {
        //     if (this.value !== null && this.value !== '') {
        //         while ([ ' ', "\r", "\n" ].includes(this.value[this.value.length - 1]))
        //             this.value = this.value.substring(0, this.value.length - 1);
        //         if (this.value !== '') {
        //             this.text.addNode({
        //                 type: 'text',
        //                 value: this._decodeHtml(this.value),
        //             });
        //         }
        //     }
            
        //     this.finish();
        //     return 0;
        // }

        if (this.value === null) {
            if (c === ' ' || c === "\r" || c === "\n")
                return 1;

            this.value = '';
        }

        step = FieldParser.IsStart(this.text, c, i, line);
        if (step > 0) {
            if (this.value !== null && this.value !== '') {
                this.text.addPart(this.value);
            }
            this.value = '';

            this.text.startParser(new FieldParser(this.text, this));
            return step;
        }

        step = ExprParser.IsStart(this.text.content, i);
        if (step > 0) {
            if (this.value !== null && this.value !== '') {
                this.text.addPart(this.value);
            }
            this.value = '';

            this.text.startParser(new ExprParser(this.text, this));
            return step;
        }

        this.value += c;

        if (i + 1 >= this.text.content.length) {
            this.text.addPart(this.value);
            this.finish();
        }

        return 1;
    }


    _decodeHtml(str)
    {
        // return this._htmlEntities.decode(str);
    }

}
module.exports = TextParser;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-strings\index.js
jsLibs.exportModule('ab-strings', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abStrings_Class
{

    escapeLangChars(string) {
        let replaceFrom = [ 'ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż',
                'Ą', 'Ć', 'Ę', 'Ł', 'Ń', 'Ó', 'Ś', 'Ź', 'Ż' ];
        let replaceTo = [ 'a', 'c', 'e', 'l', 'n', 'o', 's', 'z', 'z',
                'A', 'C', 'E', 'L', 'N', 'O', 'S', 'Z', 'Z' ];
    
        let regexp = new RegExp(replaceFrom.join('|'), 'g');
    
        return string.replace(regexp, (match) => {
            return replaceTo[replaceFrom.indexOf(match)];
        });
    }
    
    escapeToAllowedChars(string, allowedCharacters) {
        let regexp = new RegExp(`[^${allowedCharacters}]`, 'g');

        return string.replace(regexp, '');
    }

    escapeRegExpChars(string)
    {
        return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    getCharsRegExp(types = [], extra = '', langs = null)
    {
        for (let type of types) {
            if (!types.includes(type))
                throw new Error(`Unknown chars type '${type}'.`);
        }

        let chars = '';

        if (types.includes('digits'))
            chars += '0-9';
        if (types.includes('letters'))
            chars += 'a-zA-Z' + this.getLangsSpecialCharacters();
        if (types.includes('special')) {
            chars += ' `!@#%&_=/<>:;",\'' +
                '\\\\' + '\\^' + '\\$' + '\\.' + '\\[' + '\\]' + '\\|' +
                '\\(' + '\\)' + '\\?' + '\\*' + '\\+' + '\\{' + '\\}' +
                '\\-';
        }

        return chars + this.escapeRegExpChars(extra);
    }

    getCharsRegExp_Basic()
    {
        return this.getCharsRegExp([ 'digits', 'letters', 'special' ]);
    }

    getLangsSpecialCharacters(langs = null)
    {
        if (langs === null)
            langs = [ 'pl' ];

        let chars = '';
        if (langs.includes('pl'))
            chars += 'ąćęłńóśźż' + 'ĄĆĘŁŃÓŚŹŻ';

        return chars;
    }

    pad(str, pad, size)
    {
        js0.args(arguments, 'string', 'string', js0.Int);

        str = str + ``;
        while (str.length < size) 
            str = pad + str;
        return str.substr(0, size);
    }
    
    removeDoubles(string, char) {
        let regexp = new RegExp(`${char}${char}`, 'g');
        while (string.match(regexp))
            string = string.replace(regexp, char);

        return string;
    }

}
module.exports = new abStrings_Class();





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\Node.PChildren.js
jsLibs.exportModule('ab-nodes', 'Node.PChildren', (require, module, exports) => { 'use strict';

const Node = require('./Node')

const js0 = require('js0');


Object.defineProperty(Node, 'PChildren', { value:
class Node_PChildren {

    static get Property() { return 'pChildren'; }

    get length(){
        return this._children.length;
    }

    get node() {
        return this._node;
    }


    constructor(node)
    {
        js0.args(arguments, Node);

        this._node = node;
        this._children = [];
    }

    add(childNode, nextNode = null)
    {
        js0.args(arguments, Node, [ Node, js0.Default ]);

        let insertIndex = nextNode === null ?
                this._children.length : this._children.indexOf(nextNode);
        if (insertIndex === -1)
            new Error('`nextNode` does not exist in `childNode` parent.');

        childNode._parentNode = this._node;

        this._children.splice(insertIndex, 0, childNode);

        this.__onAddChild(childNode);
    }

    // addAt(index, childNode)
    // {
    //     js0.args(arguments, 'number', Node);

    //     if (index < 0)
    //         throw new Error(`Index '${index}' cannot be lower than 0.`);
    //     if (index > this._children.length)
    //         throw new Error(`Index '${index}' cannot be higher than children size '${this._children.length}'.`);
        
    //     childNode._parentNode = this._node;

    //     this._children.splice(index, 0, childNode);

    //     this.__onAddChild(childNode);
    // }

    createCopy(topNodeCopy, instanceKeys)
    {
        js0.args(arguments, Node, Array);
        js0.typeE(this._node, js0.Prop(Node.PCopyable));

        let nodeCopiesStack = [ topNodeCopy ];

        while(nodeCopiesStack.length > 0) {
            let nodeCopy = nodeCopiesStack.pop();
            let children = nodeCopy.pCopyable.getOriginalNode().pChildren;

            for (let i = 0; i < children.length; i++) {
                let childNodeCopy = children.get(i).pCopyable
                        .createCopy(instanceKeys, false);

                nodeCopy.pChildren.add(childNodeCopy);

                if (!js0.type(childNodeCopy, js0.Prop(Node.PChildren)))
                    continue;

                // /* Copy only first repeat node. */
                // console.log('Test', nodeCopy === top_node);
                if (js0.type(childNodeCopy, require('./nodes/RepeatNode')))
                    continue;

                nodeCopiesStack.push(childNodeCopy);
            }
        }
    }

    deleteCopies(topOriginalNode, instanceKeys)
    {
        js0.args(arguments, Node, Array);

        let originalNodesStack = [ topOriginalNode ];

        while(originalNodesStack.length > 0) {
            let originalNode = originalNodesStack.pop();
            let children = originalNode.pChildren;

            for (let i = 0; i < children.length; i++) {
                let childNode = children.get(i);

                childNode.pCopyable.deleteCopies(instanceKeys, false);

                if (!js0.type(childNode, js0.Prop(Node.PChildren)))
                    continue;

                originalNodesStack.push(childNode);
            }

            // nodeCopiesStack.shift();
            // children_stack.shift();
        }

        return topOriginalNode;
    }

    findNext(childNode)
    {
        let childNodeIndex = this._children.indexOf(childNode);
        js0.assert(childNodeIndex !== -1, '`childNode` not found.');

        if (childNodeIndex < this._children.length - 1)
            return this._children[childNodeIndex + 1];

        return null;
    }

    findNextHtmlElement(childNode)
    {
        let nextHtmlElement = null;
    
        // console.log('Test', this.node, childNode)

        let nextNode = this.findNext(childNode);
        if (nextNode !== null)
            nextHtmlElement = nextNode.firstHtmlElement;

        if (nextHtmlElement !== null)
            return nextHtmlElement;

        nextHtmlElement = this.__getNextHtmlElement();

        // js0.assert(typeof nextHtmlElement !== 'undefined', '???');
        // if (typeof nextHtmlElement === 'undefined')
        //     throw new Error();

        return nextHtmlElement;
    }

    // findNextHtmlElement(childNode)
    // {
    //     let nextHtmlElement = null;
     
    //     let startIndex = null;
    //     for (let i = 0; i < this._children.length; i++) {
    //         if (this._children[i] === childNode) {
    //             startIndex = i + 1;
    //             break;
    //         }
    //     }

    //     if (startIndex === null)
    //         throw new Error(`Node '${childNode}' is not a child of '${this._node}'.`);

    //     for (let i = startIndex; i < this._children.length; i++) {
    //         let nextNode = this._children[i];
    //         let nextHtmlElement = nextNode.__getFirstHtmlElement();
    //         if (!js0.type(nextHtmlElement, [ HTMLElement, Text, js0.Null ])) {
    //             throw new Error(`\`__getFirstHtmlElement\` in \`${this.constructor.name}\`` +
    //                     `does not return \`HTMLElement\`.`);
    //         }

    //         if (nextHtmlElement !== null)
    //             return nextHtmlElement;
            
    //             nextHtmlElement = this.__getNextHtmlElement();
    //         if (nextHtmlElement !== null)
    //             return nextHtmlElement;
    //     }

    //     return null;
    // }

    get(childNodeIndex)
    {
        return this._children[childNodeIndex];
    }

    remove(childNode)
    {
        js0.args(arguments, Node);

        for (let i = 0; i < this._children.length; i++) {
            if (this._children[i] === childNode) {
                childNode.refreshDisplayed(true);
                childNode.deactivate();
                this._children.splice(i, 1);
            }
        }
    }

    __getNext(childNode)
    {
        return this.findNext(childNode);
    }

    __getNextHtmlElement()
    {
        return null;
    }

    __onAddChild() { js0.virtual(this); }

}});
module.exports = Node.PChildren;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\HtmlElement.js
jsLibs.exportModule('ab-nodes', 'HtmlElement', (require, module, exports) => { 'use strict';

const
    abNodes = require('.')
;


class HtmlElement
{

    static AddChild(parentHtmlElement, htmlElement, nextHtmlElement = null)
    {
        try {
            if (nextHtmlElement === null)
                parentHtmlElement.appendChild(htmlElement);
            else
                parentHtmlElement.insertBefore(htmlElement, nextHtmlElement);
        } catch (e) {
            if (abNodes.debug)
                console.warn(e);
        }
    }

    static ClearChildren(htmlElement)
    {
        while (htmlElement.firstChild)
            htmlElement.removeChild(htmlElement.firstChild);
    }

    static RemoveChild(parentHtmlElement, htmlElement)
    {
        try {
            parentHtmlElement.removeChild(htmlElement);
        } catch (e) {
            if (abNodes.debug)
                console.warn(e);
        }
    }

}

module.exports = HtmlElement;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\Node.js
jsLibs.exportModule('ab-nodes', 'Node', (require, module, exports) => { 'use strict';

const js0 = require('js0');


class Node
{

    get active() {
        return this._active;
    }

    get displayed() {
        return this._displayed;
    }

    get firstHtmlElement() {
        let firstHtmlElement = this.__getFirstHtmlElement();
        if (!js0.type(firstHtmlElement, [ HTMLElement, Text, js0.Null ])) {
            throw new Error(`\`__getFirstHtmlElement\` in \`${this.constructor.name}\`` +
                    `does not return \`HTMLElement\`.`);
        }

        if (firstHtmlElement !== null)
            return firstHtmlElement;

        if (this.hasParent) {
            let nextHtmlElement = this.parentNode.pChildren.findNextHtmlElement(this);
            if (nextHtmlElement === null)
                return null;

            return nextHtmlElement;
        }

        return null;;
    }

    get hasParent() {
        return this._parentNode !== null;
    }

    get htmlElement() {
        let htmlElement = this.__getHtmlElement();
        if (!js0.type(htmlElement, HTMLElement)) {
            throw new Error(`\`__getHtmlElement\` in \`${this.constructor.name}\`` +
                    `does not return \`HTMLElement\`.`);
        }

        return htmlElement;
    }

    get nextHtmlElement() {
        if (this.hasParent)
            return this.parentNode.pChildren.findNextHtmlElement(this)

        return null;
    }

    get nextNode() {
        return this.hasParent ? this.parentNode.pChildren.__getNext(this) : null;
    }

    get parentNode() {
        // if (this._parentNode === null)
        //     throw new Error('Parent node not set.');

        return this._parentNode;
    }


    constructor()
    {
        this._active = false;
        this._displayed = false;
        
        this._parentNode = null;

        this._listeners_OnDisplay = [];
    }

    activate()
    {
        if (this.active)
            return;
        this._active = true;

        this.__onActivate();
    }

    addListener_OnDisplay(listener)
    {
        this._listeners_OnDisplay.push(listener);
    }

    deactivate()
    {
        if (!this.active)
            return;
        this._active = false;

        this.__onDeactivate();
    }

    refreshDisplayed(refreshChildren = false)
    {
        let displayed = this.__isDisplayed();
        if (this._displayed === displayed)
            return;

        this._displayed = displayed;
        for (let listener of this._listeners_OnDisplay)
            listener(displayed);

        if (refreshChildren) {
            if (js0.type(this, js0.Prop(Node.PChildren))) {
                for (let i = 0; i < this.pChildren.length; i++)
                    this.pChildren.get(i).refreshDisplayed(true);
            }
        }
    }

    removeListener_OnDisplay(listener)
    {
        for (let i = this._listeners_OnDisplay.length - 1; i >= 0; i--) {
            if (this._listeners_OnDisplay[i] === listener)
                this._listeners_OnDisplay.splice(i, 1);
        }
    }


    __getHtmlElement() { js0.virtual(this); }
    __getFirstHtmlElement() { js0.virtual(this); }

    __isDisplayed() { js0.virtual(this); }

    __onActivate() { js0.virtual(this); }
    __onDeactivate() { js0.virtual(this); }

}
module.exports = Node;
require('./Node.PChildren');
require('./Node.PCopyable');






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\Node.PCopyable.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\index.js
jsLibs.exportModule('ab-nodes', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abNodes_Class
{

    get HideNode() {
        return require('./nodes/HideNode');
    }

    get Node() {
        return require('./Node');
    }

    get RepeatNode() {
        return require('./nodes/RepeatNode');
    }

    get RootNode() {
        return require('./nodes/RootNode');
    }

    get ShowNode() {
        return require('./nodes/ShowNode');
    }

    get SingleNode() {
        return require('./nodes/SingleNode');
    }

    get TextNode() {
        return require('./nodes/TextNode');
    }


    get debug() {
        return this._debug;
    }
    

    constructor() {
        this._debug = false;
    }

    setDebug(debug)
    {
        js0.args(arguments, 'boolean');

        this._debug = debug;
    }

};
module.exports = new abNodes_Class();






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\HideNode.js
jsLibs.exportModule('ab-nodes', 'nodes/HideNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const Node = require('../Node');


class HideNode extends Node
{

    get hide() {
        return this._hide;
    }
    set hide(hideValue) {
        js0.args(arguments, 'boolean');

        if (hideValue === this._hide)
            return;
        this._hide = hideValue;

        if (!this.active)
            return;

        if (hideValue) {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).deactivate();
            this.refreshDisplayed(true);
        } else {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).activate();
            this.refreshDisplayed(true);
        }
    }


    constructor()
    { super();
        js0.prop(this, HideNode.PChildren, this);
        js0.prop(this, HideNode.PCopyable, this, arguments);

        this._hide = false;
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active || this.hide)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        if (this.hide)
            return;

        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        if (this.hide)
            return;

        this.refreshDisplayed(true);
        for (let i = this.pChildren.length - 1; i >= 0; i--)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        for (let i = 0; i < this.pChildren.length; i++) {
            let childFirstHtmlElement = this.pChildren.get(i).firstHtmlElement;
            if (childFirstHtmlElement !== null)
                return childFirstHtmlElement;
        }

        return null;
    }
    /* / Node */

}
module.exports = HideNode;


Object.defineProperties(HideNode, {

    PChildren: { value:
    class HideNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { super(node);

        }

        __onAddChild(childNode, nextNode)
        {
            // if (nextNode === null)
            //     childNode._nextNode = this._nextNode;

            if (this.node.active && !this.node.hide)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            return this.node.nextNode;
        }

        __getNextHtmlElement()
        {
            return this.node.nextHtmlElement;
        }

    }},

});


Object.defineProperties(HideNode, {

    PCopyable: { value:
    class HideNode_PCopyable extends Node.PCopyable {

        constructor(node, args)
        { super(node, args);

        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new HideNode();
        }

    }},

});





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\RepeatNode.js
jsLibs.exportModule('ab-nodes', 'nodes/RepeatNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');

const TextNode = require('./TextNode');


class RepeatNode extends Node
{

    constructor()
    { super();
        js0.prop(this, RepeatNode.PChildren, this);
        js0.prop(this, RepeatNode.PCopyable, this, arguments);

        this._instances = new js0.List();
    }

    add(key)
    {
        if (this._instances.has(key))
            throw new Error(`Instance with key \`${key}\` already exists.`);

        let instance = new RepeatNode.InstanceNode(this, key);

        this._instances.set(key, instance);
        let node_Original = this.pCopyable.getOriginalNode();

        let instanceKeys = this.pCopyable._instanceKeys.concat([ key ]);
        for (let i = 0; i < node_Original.pChildren.length; i++) {
            let newChildNode = node_Original.pChildren.get(i).pCopyable
                    .createCopy(instanceKeys);
            instance.pChildren.add(newChildNode);
        }
            
        if (this.active)
            instance.activate();
    }

    addAt(index, key)
    {
        if (this._instances.has(key))
            throw new Error(`Instance with key \`${key}\` already exists.`);
        if (index < 0)
            throw new Error(`Index '${index}' cannot be lower than 0.`);
        if (index > this._instances.size)
            throw new Error(`Index '${index}' cannot be higher than instances size '${this._instances.size}'.`);

        let instance = new RepeatNode.InstanceNode(this, key);

        this._instances.addAt(index, key, instance);
        let node_Original = this.pCopyable.getOriginalNode();

        let instanceKeys = this.pCopyable._instanceKeys.concat([ key ]);

        for (let i = 0; i < node_Original.pChildren.length; i++) {
            let newChildNode = node_Original.pChildren.get(i).pCopyable
                    .createCopy(instanceKeys);

            instance.pChildren.add(newChildNode);
        }

        if (this.active)
            instance.activate();
    }

    delete(key)
    {
        if (!this._instances.has(key))
            throw new Error(`Instance with key \`${key}\ does not exist.`);

        let instance = this._instances.get(key);
        this._instances.delete(key);

        let node_Original = this.pCopyable.getOriginalNode();
        let instanceKeys = this.pCopyable._instanceKeys.concat([ key ]);
        for (let i = 0; i < node_Original.pChildren.length; i++)
            node_Original.pChildren.get(i).pCopyable.deleteCopies(instanceKeys);
        //
        // for (let i = 0; i < node_Original.pChildren.length; i++) {
        //
        //     let newChildNode = node_Original.pChildren.get(i).pCopyable.createCopy(
        //             true, this.pCopyable._instanceKeys.concat([ key ]));
        //     instance.pChildren.add(newChildNode);
        // }

        if (this.active)
            instance.deactivate();
    }

    getInstanceNodeCopies(sourceNode, key)
    {
        js0.args(arguments, Node, [ 'string', 'number' ]);

        if (!this._instances.has(key))
            return null;

        let instance = this._instances.get(key);

        let nodeCopies = [];
        for (let nodeCopy of instance._nodeCopies) {
            if (nodeCopy.pCopyable.sourceNode === sourceNode)
                nodeCopies.push(nodeCopy);
        }

        return nodeCopies;
    }

    pop()
    {
        if (this._instances.size <= 0)
            throw new Error('Cannot `pop` on empty `RepeatNode`.');

        let key = Array.from(this._instances.keys)[this._instances.size - 1];
        let lastInstance = this._instances.get(key);

        if (this.active)
            lastInstance.deactivate();
    }

    push()
    {
        let index = 0;
        while(this._instances.has(index))
            index++;

        this.add(index);
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        for (let i = 0; i < this._instances.size; i++)
            this._instances.getAt(i).activate();
    }

    __onDeactivate()
    {
        for (let i = this._instances.size - 1; i >= 0; i--)
            this._instances.getAt(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this._instances.size === 0 ?
                null : this._instances.getAt(0).firstHtmlElement;
    }
    /* / Node */

}
module.exports = RepeatNode;


Object.defineProperties(RepeatNode, {

    PChildren: { value:
    class extends Node.PChildren {

        constructor(node)
        {
            super(node);
        }

        __onAddChild(childNode, nextNode)
        {
            js0.typeE(childNode, js0.Prop(Node.PCopyable));
            // js0.args(arguments, js0.Prop(Node.PCopyable), Node);
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            return this.nextNode;
        }

        __getNextHtmlElement()
        {
            if (this.node.hasParent)
                return this.node.parentNode.nextHtmlElement;

            return null;
        }

    }},


    PCopyable: { value:
    class RepeatNode_PCopyable extends Node.PCopyable
    {

        __createCopy(nodeInstance)
        {
            return new RepeatNode();
        }

    }},

});


require('./RepeatNode.InstanceNode');






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\RootNode.js
jsLibs.exportModule('ab-nodes', 'nodes/RootNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class RootNode extends Node
{

    constructor(htmlElement)
    { super();
        js0.args(arguments, HTMLElement);
        js0.prop(this, RootNode.PChildren, this);

        this._htmlElement = htmlElement;
    }


    /* Node.IListener */
    __getHtmlElement()
    {
        return this._htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this._htmlElement;
    }

    __isDisplayed()
    {
        return this.active;
    }

    __onActivate()
    {
        HtmlElement.ClearChildren(this._htmlElement);

        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).deactivate();
    }
    /* / Node.IListener */

}
module.exports = RootNode;


Object.defineProperties(RootNode, {

    PChildren: { value:
    class RootNode_PChildren extends Node.PChildren
    {

        constructor(node)
        {
            super(node);
        }

        __onAddChild(childNode)
        {
            if (this.node.active)
                childNode.activate();
        }

    }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\RepeatNode.InstanceNode.js
jsLibs.exportModule('ab-nodes', 'nodes/RepeatNode.InstanceNode', (require, module, exports) => { 'use strict';

const RepeatNode = require('./RepeatNode');

const js0 = require('js0');

const Node = require('../Node');


Object.defineProperty(RepeatNode, 'InstanceNode', { value:
class RepeatNode_InstanceNode extends Node
{

    get key() {
        return this._key;
    }

    constructor(repeatNode, key)
    { super();
        js0.args(arguments, RepeatNode);
        js0.prop(this, RepeatNode.InstanceNode.PChildren, this);
        // js0.prop(this, RepeatNode.InstanceNode.PCopyable, this);

        this._key = key;

        this._repeatNode = repeatNode;
        this._nodeCopies = [];
    }

    addNodeCopy(nodeCopy)
    {
        this._nodeCopies.push(nodeCopy);
    }


    /* Node */
    __isDisplayed()
    {
        return this._repeatNode.displayed && this.active;
    }

    __onActivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
    }

    __onDeactivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        return this._repeatNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        if (this.pChildren.length > 0)
            return this.pChildren.get(0).firstHtmlElement;

        return null;
    }
    /* / Node */

}, });
module.exports = RepeatNode.InstanceNode;


Object.defineProperties(RepeatNode.InstanceNode, {

    PChildren: { value:
    class RepeatNode_InstanceNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { 
            super(node);
        }

        __onAddChild(childNode, nextNode)
        {
            if (this.node.active)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            let instanceIndex = this.node._repeatNode._instances.indexOf(
                    this.node);
            js0.assert(instanceIndex !== -1, 'Instance not in repeat node.');

            if (instanceIndex === this.node._repeatNode._instances.size - 1)
                return this.node._repeatNode.nextNode;

            return this.node._repeatNode._instances.getAt(instanceIndex + 1);
        }

        __getNextHtmlElement()
        {   
            /* Not Sure */
            if (!this.node._repeatNode.active)
                return this.node._repeatNode.nextHtmlElement;
            /* / Not Sure */

            let startIndex = this.node._repeatNode._instances.indexOf(this.node) + 1;
            for (let i = startIndex; i < this.node._repeatNode._instances.size; i++) {
                let instance = this.node._repeatNode._instances.getAt(i);
                if (instance.pChildren.length > 0)
                    return instance.pChildren.get(0).firstHtmlElement;
            }

            return this.node._repeatNode.nextHtmlElement;
        }

    }},


    // PCopyable: { value:
    // class RepeatNode_InstanceNode_PCopyable extends Node.PCopyable
    // {
    //
    //     __createCopy(instance_nodes)
    //     {
    //         throw new Error('To do.');
    //         // return new RepeatNode.InstanceNode(this.__args[0]);
    //     }
    //
    // }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\SingleNode.js
jsLibs.exportModule('ab-nodes', 'nodes/SingleNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class SingleNode extends Node
{

    constructor(htmlElementType)
    { super();
        js0.args(arguments, 'string');
        js0.prop(this, SingleNode.PChildren, this);
        js0.prop(this, SingleNode.PCopyable, this, arguments);

        this._htmlElement = document.createElement(htmlElementType);
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        HtmlElement.AddChild(this.parentNode.htmlElement, this._htmlElement,
                this.nextHtmlElement);

        // for (let i = 0; i < this.pChildren.length; i++)
        //     this.pChildren.get(i).refreshDisplayed(true);
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
        // for (let i = this.pChildren.length - 1; i >= 0; i--)
        //     this.pChildren.get(i).refreshDisplayed(true);

        HtmlElement.RemoveChild(this.parentNode.htmlElement, this._htmlElement);
    }

    __getHtmlElement()
    {
        return this._htmlElement;
    }

    __getFirstHtmlElement()
    {
        if (!this.active)
            return null;

        return this._htmlElement;
    }
    /* / Node */

}
module.exports = SingleNode;


Object.defineProperties(SingleNode, {

    PChildren: { value:
    class SingleNode_PChildren extends Node.PChildren
    {

        constructor(node)
        {
            super(node);
        }

        __onAddChild(childNode, next_node)
        {
            childNode.activate();
        }

    }},


    PCopyable: { value:
    class SingleNode_PCopyable extends Node.PCopyable
    {

        constructor(node, args)
        {
            super(node, args);
        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new SingleNode(this.__args[0]);
        }

    }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\ShowNode.js
jsLibs.exportModule('ab-nodes', 'nodes/ShowNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const Node = require('../Node');


class ShowNode extends Node
{

    get show() {
        return this._show;
    }
    set show(showValue) {
        js0.args(arguments, 'boolean');

        if (showValue === this._show)
            return;
        this._show = showValue;

        if (!this.active)
            return;

        if (showValue) {
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).activate();
            this.refreshDisplayed(true);
        } else {
            this.refreshDisplayed(true);
            for (let i = 0; i < this.pChildren.length; i++)
                this.pChildren.get(i).deactivate();
        }
    }


    constructor()
    { super();
        js0.prop(this, ShowNode.PChildren, this);
        js0.prop(this, ShowNode.PCopyable, this, arguments);

        this._show = false;
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active || !this.show)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        if (!this.show)
            return;

        this.refreshDisplayed(true);
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
    }

    __onDeactivate()
    {
        if (!this.show)
            return;

        this.refreshDisplayed(true);
        for (let i = this.pChildren.length - 1; i >= 0; i--)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        for (let i = 0; i < this.pChildren.length; i++) {
            let childFirstHtmlElement = this.pChildren.get(i).firstHtmlElement;
            if (childFirstHtmlElement !== null)
                return childFirstHtmlElement;
        }

        return null;
    }
    /* / Node */

}
module.exports = ShowNode;


Object.defineProperties(ShowNode, {

    PChildren: { value:
    class ShowNode_PChildren extends Node.PChildren
    {

        constructor(node)
        { super(node);

        }

        __onAddChild(childNode, nextNode)
        {
            // if (nextNode === null)
            //     childNode._nextNode = this._nextNode;

            if (this.node.active && this.node.show)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let nextNode = this.findNext(childNode);
            if (nextNode !== null)
                return nextNode;

            return this.node.nextNode;
            // if (nextNode !== null)
            //     return nextNode;

            // console.log('Null!');
            // return null;
        }

        __getNextHtmlElement()
        {
            return this.node.nextHtmlElement;
        }

    }},

});


Object.defineProperties(ShowNode, {

    PCopyable: { value:
    class ShowNode_PCopyable extends Node.PCopyable {

        constructor(node, args)
        { super(node, args);

        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new ShowNode();
        }

    }},

});





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\TextNode.js
jsLibs.exportModule('ab-nodes', 'nodes/TextNode', (require, module, exports) => { 'use strict';

const js0 = require('js0');

const HtmlElement = require('../HtmlElement');
const Node = require('../Node');


class TextNode extends Node
{

    get text() {
        return this._htmlElement.nodeValue;
    }
    set text(value) {
        this._htmlElement.nodeValue = value;
    }


    constructor(text)
    { super();
        js0.prop(this, TextNode.PCopyable, this, arguments);

        this._text = text;
        this._htmlElement = document.createTextNode(text);
    }


    /* Node */
    __isDisplayed()
    {
        if (!this.active)
            return false;

        return this.parentNode.displayed;
    }

    __onActivate()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        HtmlElement.AddChild(this.parentNode.htmlElement, this._htmlElement,
                this.nextHtmlElement);
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
        HtmlElement.RemoveChild(this.parentNode.htmlElement, this._htmlElement);
    }

    __getHtmlElement()
    {
        return this._htmlElement;
    }

    __getFirstHtmlElement()
    {
        if (!this.active)
            return null;

        return this._htmlElement;
    }
    /* / Node */

}
module.exports = TextNode;


Object.defineProperties(TextNode, {

    PCopyable: { value:
    class TextNode_PCopyable extends Node.PCopyable
    {

        constructor(node, args)
        {
            super(node, args);
        }

        __createCopy() {
            return new TextNode(this.__args[0]);
        }

    }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-nodes\nodes\VirtualNode.js
jsLibs.exportModule('ab-nodes', 'nodes/VirtualNode', (require, module, exports) => { 'use strict';

const abNodes = require('ab-nodes');
const js0 = require('js0');


class VirtualNode extends abNodes.Node
{

    constructor()
    { super();
        js0.prop(this, VirtualNode.PChildren, this);

        // this._idNodes = {};
    }

    // setIds(id_nodes)
    // {
    //     js0.argsE(arguments, 'object');
    //
    //     this._idNodes = id_nodes;
    // }


    /* Node */
    __isDisplayed()
    {
        return this.parentNode.displayed && this.active;
    }

    __onActivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
        for (let i = this.pChildren.length - 1; i >= 0; i--)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this.pChildren.length === 0 ?
                null : this.pChildren.get(0).firstHtmlElement;
    }
    /* / Node */

}


Object.defineProperties(VirtualNode, {

    PChildren: { value:
    class VirtualNode_PChildren extends abNodes.Node.PChildren
    {

        constructor(node)
        {
            super(node);
        }
        
        __onAddChild(childNode, next_node)
        {
            if (next_node === null)
                childNode._nextNode = this._nextNode;

            if (this.node.active)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let next_node = this.findNext(childNode);
            if (next_node !== null)
                return next_node;

            return this.node.nextNode;
        }

    }}

});


module.exports = VirtualNode;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-layouts\Parser.js
jsLibs.exportModule('ab-layouts', 'Parser', (require, module, exports) => { 'use strict';

const abNodes = require('ab-nodes');
const js0 = require('js0');

const LayoutNode = require('./LayoutNode');


class Parser
{

    get __elementsStack() {
        return this._elementsStack;
    }


    constructor(layoutContent)
    {
        this._elementsStack = null;
        this._extendFns = [];
    }

    extend(fn)
    {
        this._extendFns.push(fn);
    }

    parse(layoutContent)
    {
        js0.args(arguments, Array);

        this.__beforeParse();

        let layoutNode = new LayoutNode();

        let parentsStack = [{
            node: null,
            nodeContent: layoutContent,
            elements: [],
        }];

        while (parentsStack.length > 0) {
            let parent = parentsStack.pop();

            for (let i = 0; i < parent.nodeContent.length; i++) {
                let nodeInfo = this._parseNodeInfo(parent.nodeContent[i]);

                let element = this.__createElement(nodeInfo, parent.elements);
                if (!js0.type(element, Parser.Element)) {
                    throw new Error(`\`__createNode\` must return` +
                            ` \`abLayout.Parser.Element\` object.`);
                }

                // if ('_id' in nodeInfo.attribs) {
                //     if (nodeInfo.attribs._id in id_nodes) {
                //         console.warn('Node with id `' + nodeInfo.attribs._id +
                //                 '` already exists.');
                //     }
                //     // id_nodes[nodeInfo.attribs._id] = node;
                // }

                if (parent.node === null)
                    layoutNode.pChildren.add(element.topNode);
                else
                    parent.node.pChildren.add(element.topNode);

                if (nodeInfo.type === '_content')
                    continue;

                if (js0.type(element.bottomNode, js0.Prop(abNodes.Node.PChildren))) {
                    parentsStack.push({
                        node: element.bottomNode,
                        nodeContent: nodeInfo.content,
                        elements: parent.elements.concat([ element ]),
                    });
                }
            }

            // parentNodesStack.pop();
            // parent.nodeContentsStack.pop();
            // return;
        }

        // layoutNode.setIds(id_nodes);

        this.__afterParse();

        return layoutNode;
    }


    _execExtendFns(element)
    {
        for (let extendFn of this._extendFns)
            extendFn(element);
    }

    _parseNodeInfo(nodeInfo)
    {
        /* Validate */
        if (!js0.argsC(arguments, [ Array, 'string' ]) || nodeInfo === null) {
            console.error('Error info:', nodeInfo)
            throw new Error(`Node info must be an \`Array\` or \`string\`.`);
        }
        /* / Validate */
        if (nodeInfo instanceof Array) {
            if (!js0.type(nodeInfo[0], 'string')) {
                console.error('Error info:', nodeInfo);
                throw new Error('First element of node info array must be a string.');
            }

            let nodeType = nodeInfo[0];
            let nodeAttribs = {};
            let nodeContent = [];
            for (let i = 1; i < nodeInfo.length; i++) {
                /* Parse Args */
                if (js0.type(nodeInfo[i], js0.RawObject)) {
                    for (let attribName in nodeInfo[i]) {
                        let attribValue = nodeInfo[i][attribName];

                        if (!js0.type(attribValue, [ 'string', Array ]) ||
                                attribValue === null) {
                            console.error('Error info: ', nodeInfo[i]);
                            throw new Error(`Node attrib must be \`string\` or \`Array\`.`);
                        }

                        if (!(attribName in nodeAttribs))
                            nodeAttribs[attribName] = [];

                        if (js0.type(attribValue, 'string'))
                            nodeAttribs[attribName].push(attribValue);
                        else
                            nodeAttribs[attribName] = nodeAttribs[attribName]
                                    .concat(attribValue);
                    }
                /* Parse Node */
                } else
                    nodeContent.push(nodeInfo[i]);
            }

            let element = {
                type: nodeType,
                attribs: nodeAttribs,
                content: nodeContent,
            };

            this._execExtendFns(element);

            return element;
        } else {
            let element = {
                type: '_content',
                attribs: {},
                content: nodeInfo,
            }

            this._execExtendFns(element);

            return element;
        }

        // let nodeType = nodeInfo_keys[0];
        // let nodeContent = nodeInfo[nodeType];
        // this._validateNodeContent(nodeContent);
        //
        // let nodeAttribs = this._parseNodeAttrs(nodeType, nodeContent);
        // if (nodeAttribs !== null)
        //     nodeContent.splice(0, 1);
        //
    }

    _parseNodeAttrs(nodeType, nodeContent)
    {
        if (nodeContent === null)
            return null;
        if (nodeContent.length === 0)
            return null;
        if (Object.keys(nodeContent[0]).length === 0)
            return {};

        let attribs = null;
        for (let attribName in nodeContent[0]) {
            if (attribName[0] !== '_') {
                if (attribs !== null) {
                    console.error('Error info:', { nodeType:  nodeContent });
                    new Error('Only attribs are allowed in first content element.');
                }

                continue;
            }

            if (attribs === null)
                attribs = {};

            attribs[attribName] = nodeContent[0][attribName];
        }

        return attribs;
    }

    // _validateNodeContent(nodeType, nodeContent)
    // {
    //     if (nodeContent !== null) {
    //         if (!(nodeContent instanceof Array)) {
    //             console.error('Error info:', nodeType, nodeContent);
    //             throw new Error('Node content must be `null` or `Array`.');
    //         }
    //     }
    // }


    __afterParse()
    {

    }

    __beforeParse()
    {

    }


    __createElement(nodeInfo) { js0.virtual(this); }

}
module.exports = Parser;


Object.defineProperties(Parser, {

    Element: { value:
    class
    {

        constructor(topNode, bottomNode, info)
        {
            this.topNode = topNode;
            this.bottomNode = bottomNode;
            this.info = info;
        }

    }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-layouts\index.js
jsLibs.exportModule('ab-layouts', 'index', (require, module, exports) => { 'use strict';

const LayoutNode = require('./LayoutNode');


class abLayouts_Class
{

    get LayoutNode() {
        return LayoutNode;
    }

    get Parser() {
        return require('./Parser');
    }

}
module.exports = new abLayouts_Class();






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-layouts\LayoutNode.js
jsLibs.exportModule('ab-layouts', 'LayoutNode', (require, module, exports) => { 'use strict';

const abNodes = require('ab-nodes');
const js0 = require('js0');


class LayoutNode extends abNodes.Node
{

    constructor()
    { super();
        js0.prop(this, LayoutNode.PChildren, this);
        js0.prop(this, LayoutNode.PCopyable, this, arguments);

        // this._idNodes = {};
    }

    // setIds(id_nodes)
    // {
    //     js0.argsE(arguments, 'object');
    //
    //     this._idNodes = id_nodes;
    // }


    /* Node */
    __isDisplayed()
    {
        return this.parentNode.displayed && this.active;
    }

    __onActivate()
    {
        for (let i = 0; i < this.pChildren.length; i++)
            this.pChildren.get(i).activate();
        this.refreshDisplayed(true);
    }

    __onDeactivate()
    {
        this.refreshDisplayed(true);
        for (let i = this.pChildren.length - 1; i >= 0; i--)
            this.pChildren.get(i).deactivate();
    }

    __getHtmlElement()
    {
        js0.assert(this.parentNode !== null, 'Parent node not set.');

        return this.parentNode.htmlElement;
    }

    __getFirstHtmlElement()
    {
        return this.pChildren.length === 0 ?
                null : this.pChildren.get(0).firstHtmlElement;
    }
    /* / Node */

}
module.exports = LayoutNode;


Object.defineProperties(LayoutNode, {

    PChildren: { value:
    class LayoutNode_PChildren extends abNodes.Node.PChildren
    {

        constructor(node)
        {
            super(node);
        }
        
        __onAddChild(childNode, next_node)
        {
            if (next_node === null)
                childNode._nextNode = this._nextNode;

            if (this.node.active)
                childNode.activate();
        }

        __getNext(childNode)
        {
            let next_node = this.findNext(childNode);
            if (next_node !== null)
                return next_node;

            return this.node.nextNode;
        }

        __getNextHtmlElement()
        {
            return this.node.nextHtmlElement;
        }

    }},

    PCopyable: { value:
    class LayoutNode_PCopyable extends abNodes.Node.PCopyable
    {

        constructor(node, args)
        {
            super(node, args);
        }

        __createCopy(deepCopy, nodeInstances)
        {
            return new LayoutNode(this.__args[0]);
        }

    }},
});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\index.js
jsLibs.exportModule('ab-fields', 'index', (require, module, exports) => { 'use strict';

const
    Definition = require('./definitions/Definition'),
    Field = require('./fields/Field'),


    ListDefinition = require('./definitions/ListDefinition'),
    ListField = require('./fields/ListField'),

    ObjectDefinition = require('./definitions/ObjectDefinition'),
    ObjectField = require('./fields/ObjectField'),

    VarDefinition = require('./definitions/VarDefinition'),
    VarField = require('./fields/VarField')
;

module.exports.debug = false;
function setDebug(debug) {
    module.exports.debug = debug;
}

function define() {
    return new ObjectDefinition();
}

module.exports.Definition = Definition;
module.exports.Field = Field;

module.exports.ListDefinition = ListDefinition;
module.exports.ListField = ListField;

module.exports.ObjectDefinition = ObjectDefinition;
module.exports.ObjectField = ObjectField;

module.exports.VarDefinition = VarDefinition;
module.exports.VarField = VarField;

module.exports.setDebug = setDebug;
module.exports.define = define;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\fields\ObjectField.js
jsLibs.exportModule('ab-fields', 'fields/ObjectField', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    abFields = require('../.'),
    ObjectDefinition = require('../definitions/ObjectDefinition'),

    Field = require('./Field')
;

class ObjectField extends Field {

    get $value() {
        return this._root;
    }
    set $value(value) {
        js0.args(arguments, js0.RawObject);

        if (value === null) {
            for (let key in this._fields)
                this._fields[key].$value = null;

            return;
        }

        for (let key in value) {
            if (key in this._fields) {
                try {
                    this._fields[key].$value = value[key];
                } catch (err) {
                    console.error('ABFields Stack: ', key);
                    throw err;
                }
            } else if (abFields.Debug)
                console.warn(new Error(`Field '${key}' not defined in Object.`));
        }
    }


    constructor(definition, keys)
    { super(definition, keys);
        js0.args(arguments, ObjectDefinition, Array);

        this._root = {};
        this._fields = {};
        
        for (let fieldName in this.__definition.fields) {
            let fieldDef = this.__definition.fields[fieldName];
            let field = fieldDef.create(keys, this._root, fieldName);
            this._fields[fieldName] = field;
        }
    }   

    $delete(key)
    {
        js0.args(arguments, [ 'number', 'string' ]);

        if (!(key in this._fields))
            throw new Error(`Key '${key}' does not exist.`);

        delete fields[key];

        for (let listener of this._listeners) {
            if ('delete' in listener)
                listener.delete(key, this._parentFields._keys);
            if ('change' in listener)
                listener.change(value, this._parentFields._keys);
        }
    }

    $get(fieldName)
    {
        if (!this.$exists(fieldName))
            throw new Error(`Field '${fieldName}' does not exist in object.`);

        return this._fields[fieldName];
    }

    $exists(fieldName)
    {
        return fieldName in this._fields;
    }

}
module.exports = ObjectField;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\fields\ListField.js
jsLibs.exportModule('ab-fields', 'fields/ListField', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    ListDefinition = require('../definitions/ListDefinition'),

    Field = require('./Field')
;

class ListField extends Field {

    get $size() {
        return this._items.size;
    }

    get $value() {
        let self = this;
        return function() {
            let hasKey = arguments.length > 0;
            let hasValue = arguments.length > 1;

            if (arguments.length > 0) {
                let key = arguments[0];
                if (!js0.type(key, [ 'number', 'string' ]))
                    throw new Error(`List 'key' must be a number or string.`);

                if (!self.$has(key))
                    self.$add(key);

                if (arguments.length > 1) {
                    self.$get(key).$value = arguments[1];
                    return undefined;
                }

                return self.$get(key).$value;
            }
            
            return self;
        }
    }
    set $value(value) {
        if (!js0.type(value, [ js0.Null, js0.Iterable ]))
            throw new Error('List value must be an iterable or null.');

        if (value === null)
            return;

        let oldKeys = this.$keys();

        if (value instanceof Array) {
            for (let key of oldKeys) {
                if (!Number.isInteger(key)) {
                    this.$delete(key);
                    continue;
                }

                if (key < 0 || key >= value.length)
                    this.$delete(key);
            }

            for (let i = 0; i < value.length; i++)
                this.$set(i, value[i]);
        } else {
            for (let key of oldKeys) {
                if (!value.has(key))
                    this.$delete(key);
            }
            
            for (let [ key, item ] of value)
                this.$set(key, item);
        }
    }

    constructor(definition, keys)
    { super(definition, keys);
        js0.args(arguments, ListDefinition, Array);

        this._root = {};
        this._items = new js0.List();
    }   

    [Symbol.iterator]()
    {
        return new ListField.Iterator(this);
    }

    $add(key, value = null)
    {
        js0.args(arguments, [ 'number', 'string' ], null);

        this.$addAt(this.$size, key, value);

        // if (this._items.has(key))
        //     throw new Error(`Key '${key}' already exists in list.`);

        // let keys = this.__keys.slice();
        // keys.push(key);

        // let itemField = this.__definition.item().create(keys);
        // this._items.set(key, itemField);

        // for (let listener of this.__definition.listeners) {
        //     if ('add' in listener)
        //         listener.add(key, this.__keys);
        // }

        // this.$get(key).$value = value;
    }

    $addAt(index, key, value = null)
    {
        js0.args(arguments, 'number', [ 'number', 'string' ], null);

        if (this._items.has(key))
            throw new Error(`Key '${key}' already exists in list.`);

        if (index < 0)
            throw new Error(`Index '${index}' cannot be lower than 0.`);
        if (index > this.$size)
            throw new Error(`Index '${index}' cannot be higher than list size '${this.$size}'.`);

        let keys = this.__keys.slice();
        keys.push(key);
        // keys.splice(index, 0, key);

        let itemField = this.__definition.item().create(keys);
        this._items.addAt(index, key, itemField);

        for (let listener of this.__definition.listeners) {
            if ('add' in listener)
                listener.add(index, key, this.__keys);
            if ('change' in listener)
                listener.change(value, this.__keys);
        }

        this.$get(key).$value = value;
    }

    $delete(key)
    {
        js0.args(arguments, [ 'number', 'string' ]);

        if (!this.$has(key))
            throw new Error(`Key '${key}' does not exist in 'ListField'.`);

        this._items.delete(key);

        for (let listener of this.__definition._listeners) {
            if ('delete' in listener)
                listener.delete(key, this.__keys);
            if ('change' in listener)
                listener.change(value, this.__keys);
        }
    }

    $deleteAt(index)
    {
        js0.args(arguments, [ 'number', ]);

        if (index < 0)
            throw new Error(`Index '${index}' cannot be lower than 0.`);

        if (index >= this.$size)
            throw new Error(`Index '${index}' is higher than list size '${this.$size}.`);

        let key = this._items.getKeyAt(index);
        this.$delete(key);
    }

    $get(key)
    {
        js0.args(arguments, [ 'number', 'string' ]);

        if (!(this._items.has(key)))
            throw new Error(`Item with key '${key}' does not exist in list.`);

        return this._items.get(key);
    }

    $has(key)
    {
        return this._items.has(key);
    }

    $index(key)
    {
        let keys = this.$keys();
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] === key)
                return i;
        }

        return -1;
    }

    $keys()
    {
        return this._items.keys();
    }

    $push(value = null)
    {
        let index = 0;

        if (this._items.size > 0) {
            let lastKey = this._items.getKeyAt(this._items.size - 1);
            if (Number.isInteger(lastKey))
                index = lastKey + 1;
        }

        while (this.$has(index))
            index++;

        this.$add(index, value);
        this.$get(index).$value = value;
    }

    $set(key, value)
    {
        js0.args(arguments, [ 'number', 'string' ]);

        if (!this.$has(key))
            this.$add(key, value);
        else
            this.$get(key).$value = value;
    }

}
module.exports = ListField;


Object.defineProperties(ListField, {

    Iterator: { value:
    class ListField_Iterator
    {

        constructor(listField)
        {
            this._list = listField;
            this._iterator = listField._items[Symbol.iterator]();
        }

        next()
        {
            let iteratorItem = this._iterator.next();

            if (iteratorItem.done)
                return { value: undefined, done: true, };

            return {
                value: [ iteratorItem.value[0], this._list.$get(iteratorItem.value[0]), ],
                done: false,
            };
        }

    }},

});





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\fields\Field.js
jsLibs.exportModule('ab-fields', 'fields/Field', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Definition = require('../definitions/Definition')
;

class Field
{

    get $value() { js0.virtual(this); }
    set $value(value) { js0.virtual(this); }


    constructor(definition, keys)
    {
        js0.args(arguments, Definition, Array);

        this.__definition = definition;
        this.__keys = keys;
    }

}
module.exports = Field;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\definitions\Definition.js
jsLibs.exportModule('ab-fields', 'definitions/Definition', (require, module, exports) => { 'use strict'

const
    js0 = require('js0')
;

class Definition
{

    get listeners() {
        return this._listeners;
    }


    constructor()
    {
        this._listeners = [];
    }

    addListener(listener)
    {
        js0.args(arguments, 'object');

        this._listeners.push(listener);
    }


    create(keys = [], root = null, fieldName = null) { js0.virtual(this); }

}
module.exports = Definition;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\definitions\ObjectDefinition.js
jsLibs.exportModule('ab-fields', 'definitions/ObjectDefinition', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    ObjectField = require('../fields/ObjectField'),

    Definition = require('./Definition'),
    ListDefinition = require('./ListDefinition'),
    VarDefinition = require('./VarDefinition')
;

class ObjectDefinition extends Definition
{

    get fields() {
        return this._fieldDefinitions;
    }


    constructor()
    { super();

        this._fieldDefinitions = {};
    }

    exists(fieldName)
    {
        return fieldName in this._fieldDefinitions;
    }

    get(fieldName)
    {
        if (!this.exists(fieldName))
            throw new Error(`Field definition '${fieldName}' does not exist.`);

        return this._fieldDefinitions[fieldName];
    }

    list(fieldName, overwrite = false)
    {
        js0.args(arguments, 'string');

        if (fieldName in this._fieldDefinitions) {
            let def = this._fieldDefinitions[fieldName];

            if (!overwrite) {
                if (!(def instanceof ListDefinition))
                    throw new Error(`Field '${fieldName}' already defined not as 'List'.`);

                return def;
            } else {
                if (def instanceof ListDefinition)
                    return def;
            }
        }

        let def = new ListDefinition();
        this._fieldDefinitions[fieldName] = def;

        return def;
    }

    object(fieldName, overwrite = false)
    {
        js0.args(arguments, 'string');

        if (fieldName in this._fieldDefinitions) {
            let def = this._fieldDefinitions[fieldName];

            if (!overwrite) {
                if (!(def instanceof ObjectDefinition))
                    throw new Error(`Field '${fieldName}' already defined not as 'Object'.`);
                return def;
            } else {
                if (def instanceof ObjectDefinition)
                    return def;
            }
        }

        let def = new ObjectDefinition();
        this._fieldDefinitions[fieldName] = def;

        return def;
    }

    var(fieldName, overwrite = false)
    {   
        js0.args(arguments, 'string');

        if (fieldName in this._fieldDefinitions) {
            let def = this._fieldDefinitions[fieldName];

            if (!overwrite) {
                if (!(def instanceof VarDefinition))
                    throw new Error(`Field '${fieldName}' already defined not as 'Var'.`);
                return def;
            } else {
                if (def instanceof VarDefinition)
                    return def;
            }
        }

        let def = new VarDefinition();
        this._fieldDefinitions[fieldName] = def;

        return def;
    }

    /* Definition Overrides */
    create(keys = [], root = null, fieldName = null)
    {
        js0.args(arguments, [ js0.Default, Array ], [ js0.Default, 'object' ], 
                [ js0.Default, 'string' ]);

        let field = new ObjectField(this, keys);

        if (root !== null && fieldName !== null) {
            Object.defineProperty(root, fieldName, {
                get: () => {
                    return field.$value;
                },
                set: (value) => {
                    try {
                        field.$value = value;   
                    } catch (err) {
                        console.error('ABFields Stack: ', fieldName);
                        throw err;
                    }
                },
                enumerable: true,
            });
        }

        return field;
    }
    /* / Definition Overrides */

}
module.exports = ObjectDefinition;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\fields\VarField.js
jsLibs.exportModule('ab-fields', 'fields/VarField', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    VarDefinition = require('../definitions/VarDefinition'),

    Field = require('./Field')
;

class VarField extends Field
{

    get $value() {
        return this._value;
    }
    set $value(value) {
        this._value = value;

        for (let listener of this.__definition.listeners) {
            if ('change' in listener)
                listener.change(value, this.__keys);
        }
    }

    constructor(definition, keys)
    { super(definition, keys);
        js0.args(arguments, VarDefinition, Array);

        this._value = undefined;
    }

}
module.exports = VarField;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\definitions\VarDefinition.js
jsLibs.exportModule('ab-fields', 'definitions/VarDefinition', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    VarField = require('../fields/VarField'),

    Definition = require('./Definition')
;

class VarDefinition extends Definition
{

    constructor()
    { super();

    }

    /* Definition Overrides */
    create(keys = [], root = null, fieldName = null)
    {
        js0.args(arguments, [ js0.Default, Array ], [ js0.Default, 'object' ], 
                [ js0.Default, 'string' ]);

        let field = new VarField(this, keys);

        if (root !== null && fieldName !== null) {
            Object.defineProperty(root, fieldName, {
                get: () => {
                    return field.$value;
                },
                set: (value) => {
                    field.$value = value;
                },
                enumerable: true,
            });
        }

        return field;
    }
    /* / Definition Overrides */

}
module.exports = VarDefinition;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-fields\definitions\ListDefinition.js
jsLibs.exportModule('ab-fields', 'definitions/ListDefinition', (require, module, exports) => { 'use strict';

const 
    js0 = require('js0'),

    ListField = require('../fields/ListField'),

    Definition = require('./Definition'),
    VarDefinition = require('./VarDefinition')
;

class ListDefinition extends Definition
{

    constructor()
    { super();
        this._itemDefinition = null;
    }

    item(itemDefinitionClass = null)
    {
        js0.args(arguments, [ js0.Default, 'function' ]);

        if (this._itemDefinition === null) {
            if (itemDefinitionClass === null)
                itemDefinitionClass = VarDefinition;
            
            this._itemDefinition = new itemDefinitionClass();
            return this._itemDefinition;
        }

        if (itemDefinitionClass !== null) {
            if (!(this._itemDefinition instanceof itemDefinitionClass)) {
                throw new Error(`List items definition class already declared as 
                        '${this._itemDefinition.constructor.name}'.`);
            }
        }

        return this._itemDefinition;
    }


    /* Definition Overrides */
    create(keys = [], root = null, fieldName = null)
    {
        js0.args(arguments, [ js0.Default, Array ], [ js0.Default, 'object' ], 
                [ js0.Default, 'string' ]);

        let field = new ListField(this, keys);

        if (root !== null && fieldName !== null) {
            Object.defineProperty(root, fieldName, {
                get: () => {
                    return field.$value;
                },
                set: (value) => {
                    field.$value = value;
                },
                enumerable: true,
            });
        }

        return field;
    }
    /* / Definition Overrides */

}
module.exports = ListDefinition;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\js0\Delay.js
jsLibs.exportModule('js0', 'Delay', (require, module, exports) => { 'use strict';

const
    js0 = require('.')
;

class Delay
{

    constructor()
    {
        this._delays = [];
    }

    delay(identification, alias, fn, time)
    {
        js0.args(arguments, null, 'string', 'function');

        let delay = this._getDelay(identification, alias);
        if (delay === null) {
            delay = {
                identificator: identificator,
                alias: alias,
                timeout: null,
            };
        } else
            clearTimeout(delay.timeout);

        delay.timeout = setTimeout(() => {
            fn();
            this._removeDelay(identificator, alias);
        }, time);
    }


    _getDelay(identificator, alias)
    {
        for (let delay of this._delays) {
            if (delay.identificator !== identificator)
                continue;
            if (delay.alias !== alias)
                continue;

            return delay;
        }

        return null;
    }

    _removeDelay(identificator, alias)
    {
        for (let i = 0; i < this._delays.length; i++) {
            let delay = this._delays[i];
            if (delay.identificator !== identificator)
                continue;
            if (delay.alias !== alias)
                continue;

            this._delays.splice(i, 1);
            return;
        }
    }

}
module.exports = Delay;





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\js0\Info.js
jsLibs.exportModule('js0', 'Info', (require, module, exports) => { // 'use strict';

// let js0 = require('.');


// class Info
// {

//     construct(class_object)
//     {
//         this._object = class_object;

//         this._abstractClassInterfaces = [];

//         this._implemented = [];
//     }

//     abstract(class_object, interface_class)
//     {
//         js0.args(arguments, 'object', js0.Interface);

//         this._abstractClassInterfaces.push(interface_class);
//     }

//     implements(class_objects)
//     {

//     }

// }
// module.exports = Info;






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\js0\List.js
jsLibs.exportModule('js0', 'List', (require, module, exports) => { 'use strict';

const js0 = require('.');


class List
{

    get size() {
        return this._values.length;
    }


    constructor(iterable = null)
    {
        js0.args(arguments, [ js0.Iterable, js0.Default ]);

        this._keys = [];
        this._values = [];

        if (iterable !== null) {
            for (let item of iterable) {
                if (item instanceof Array) {
                    if (item.length === 2) {
                        this.set(item[0], item[1]);
                        continue;
                    }
                }

                this.add(item);
            }
        }
    }

    [Symbol.iterator]()
    {
        return new List.Iterator(this);
    }

    add(...values)
    {
        let index = 0;
        for (let value of values) {
            while(this._keys.includes(index))
                index++;

            this.set(index, value);
        }
    }

    addAll(values)
    {
        js0.args(arguments, js0.Iterable);

        let index = 0;
        for (let value of values) {
            while(this._keys.includes(index))
                index++;

            this.set(index, value);
        }
    }

    addAt(index, key, value)
    {
        if (index < 0 || index > this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        if (this._values.length === index) {
            this._keys.push(key);
            this._values.push(value);
        } else {
            this._keys.splice(index, 0, key);
            this._values.splice(index, 0, value);
        }

    }

    delete(key)
    {
        let index = this._getIndexE(key);
        this.deleteAt(index);
    }

    deleteAt(index)
    {
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
    }

    get(key)
    {
        let index = this._getIndexE(key);

        return this._values[index];
    }

    getAt(index)
    {
        if (index < 0 || index >= this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        return this._values[index];
    }

    getKeyAt(index)
    {
        if (index < 0 || index >= this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        return this._keys[index];
    }

    getKeys()
    {
        return this._keys.slice();
    }

    getValues()
    {
        return this._values.slice();
    }

    has(key)
    {
        return this._keys.includes(key);
    }

    includes(value)
    {
        return this._values.includes(value);
    }

    indexOf(value)
    {
        return this._values.indexOf(value);
    }

    keys()
    {
        return this._keys.slice();
    }

    remove(value)
    {
        for (let i = this.size - 1; i >= 0; i--) {
            if (this.getAt(i) === value) {
                this.deleteAt(i);
                return;
            }
        }     

        throw new Error(`Value '${value}' does not exist in List.`);
    }

    set(key, value)
    {
        let index = this._keys.indexOf(key);
        if (index === -1)
            index = this._values.length;

        this.setAt(index, key, value);
    }

    setAt(index, key, value)
    {
        if (index < 0 || index > this._values.length)
            throw new Error(`Index \`${index}\` does not exist in \`List\`.`);

        if (index === this._values.length) {
            this._keys.push(key);
            this._values.push(value);
        } else {
            this._keys[index] = key;
            this._values[index] = value;
        }
    }

    slice()
    {

    }

    sort(compareFn)
    {
        let newKeys = this._keys.slice();
        newKeys.sort((aKey, bKey) => {
            return compareFn({ key: aKey, value: this.get(aKey) },
                    { key: bKey, value: this.get(bKey) });
        });

        let newValues = [];
        for (let i = 0; i < this.size; i++)
            newValues.push(this.get(newKeys[i]));

        this._keys = newKeys;
        this._values = newValues;
    }

    values()
    {
        return this._values.slice();
    }


    _getIndexE(key)
    {
        let index = this._keys.indexOf(key);
        if (index === -1)
            throw new Error(`Key \`${key}\` does not exist in \`List\`.`);

        return index;
    }

}
module.exports = List;


Object.defineProperties(List, {

    Iterator: { value:
    class List_Iterator
    {

        constructor(list)
        {
            this._list = list;
            this._iterator = list._keys[Symbol.iterator]();
        }

        next()
        {
            let keyItem = this._iterator.next();

            if (keyItem.done)
                return { value: undefined, done: true, };

            return {
                value: [ keyItem.value, this._list.get(keyItem.value), ],
                done: false,
            };
        }

    }},

});






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\js0\index.js
jsLibs.exportModule('js0', 'index', (require, module, exports) => { 'use strict';


class js0_Class
{

    get List() {
        return require('./List');
    }

    get TimeSpan() {
        return require('./TimeSpan');
    }


    constructor()
    {
        
    }

    args(args, ...types)
    {
        for (let i = 0; i < types.length; i++) {
            let errors = [];
            if (!this.type(args[i], types[i], errors)) {
                console.error(`Error: Argument ${i} -> `, errors);
                throw new this.TypeError('Wrong argument type.');
            }
        }
    }

    argsC(args, ...types)
    {
        for (let i = 0; i < types.length; i++) {
            if (!this.type(args[i], types[i]))
                return false;
        }

        return true;
    }

    assert(value, message = '')
    {
        if (!value)
            throw new this.AssertionError(message);
    }

    copyArray(arr)
    {
        this.args(arguments, Array);

        let valueTypes = [
            'undefined',
            'boolean',
            'number',
            'string',
        ];

        let arr_New = new Array();
        for (let val of arr) {
            // if (this.type(val, valueTypes)) {
            //     arr_New.push(val);
            //     continue;
            // }

            if (this.type(val, js0.Null)) {
                arr.push(null);
                continue;
            }

            if (this.type(val, this.RawObject)) {
                arr_New.push(this.copyObject(val));
                continue;
            }

            if (this.type(val, Array)) {
                arr_New.push(this.copyArray(val));
                continue;
            }

            arr_New.push(val);
        }

        return arr_New;
    }

    copyObject(obj)
    {
        this.args(arguments, js0.RawObject);

        let valueTypes = [
            'undefined',
            'boolean',
            'number',
            'string',
        ];

        let obj_New = {};
        for (let prop in obj) {
            // if (this.type(obj[prop], valueTypes)) {
            //     obj_New[prop] = obj;
            //     continue;
            // }
            if (this.type(obj[prop], js0.Null)) {
                obj_New[prop] = null;
                continue;
            }

            if (this.type(obj[prop], this.RawObject)) {
                obj_New[prop] = this.copyObject(obj[prop]);
                continue;
            }

            if (this.type(obj[prop], Array)) {
                obj_New[prop] = this.copyArray(obj[prop]);
                continue;
            }

            obj_New[prop] = obj[prop];
        }

        return obj_New;
    }

    // implement(mainObject, propClass, ...propArgs)
    // {
    //     this.prop(mainObject, propClass, ...propArgs);
    // }

    // implements(object, propClass)
    // {
    //     return this.type(object, this.Prop(propClass));
    // }

    prop(mainObject, propClass, ...propArgs)
    {
        this.args(arguments, 'object', 'function');

        if (!('Property' in propClass)) {
            throw new Error(`\`${propClass}\` is not a \`Property\` ` +
                    `(no \`Property\` in object prototype).`);
        }
        if (typeof propClass.Property !== 'string') {
            throw new Error(`\`${propClass}\` is not a \`Property\` ` +
                    `(\`Property\` is not a string).`);
        }

        propArgs.splice(0, 0, null);
        let prop = new (Function.prototype.bind.apply(propClass, propArgs))();
        Object.defineProperty(mainObject, propClass.Property, {
            get: () => { return prop; },
        });
    }

    implements(mainObject, ...interfaceClasses)
    {

    }

    rtn(valueType, value = this.NotSet)
    {
        if (value === this.NotSet) {
            return (value) => {
                this.typeE(value, valueType);
                return value;
            };
        }

        this.typeE(value, valueType);
        return value;
    }

    type(value, valueType, errors = [])
    {
        if (valueType === null)
            return true;

        let typeofValue = typeof value;

        /* Special Types */
        if (valueType === this.ArrayItems) {
            if (value === null || typeof value !== 'object') {                
                errors.push(`\`${value}\` is not an instance \`Array\`.`);
                return false;
            }

            if (!(value instanceof Array)) {
                errors.push(`\`${value}\` is not an instance of \`Array\`.`);
                return false;
            }

            return true;
        } else if (valueType === this.Default) {
            if (value === undefined)
                return true;

            return false;
        } else if (valueType === this.Int) {
            return this.type(value, 'int', errors);
        } else if (valueType === this.Iterable) {
            if (value === null || typeof value !== 'object') {                
                errors.push(`\`${value}\` is not \`Iterable\`.`);
                return false;
            }

            if (typeof value[Symbol.iterator] !== 'function') {
                errors.push(`\`${value}\` is not \`Iterable\`.`);
                return false;
            }

            return true;
        } else if (valueType === this.Long) {
            return this.type(value, 'bigint', errors);
        } else if (valueType === this.Object) {
            return this.type(value, 'object', errors);
        } else if (valueType === this.RawObject) {
            if (value === null)
                return true;

            if (typeofValue === 'undefined') {
                errors.push(`'${value}' is not an RawObject.`);
                return false;
            }

            // if (!(typeof value !== 'object')) {
            //     console.log(typeof value);
            //     errors.push(`'${value}' is not an RawObject.`);
            //     return false;
            // }

            if (Object.getPrototypeOf(value) !== Object.prototype) {
                errors.push(`'${value}' is not an RawObject.`);
                return false;
            }

            return true;
        } else if (valueType === this.NotNull) {
            if (value === null) {
                errors.push(`\`${value}\` cannot be \`null\`.`);
                return false;
            }

            return true;
        } else if (valueType === this.Null) {
            if (value === null)
                return true;

            return false;
        } else if (valueType instanceof this.ArrayItems_Type) {
            if (!this.type(value, Array)) {
                errors.push(`Value must be an instance of Array. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            let i = 0;
            for (let itemValue of value) {
                let itemErrors = [];
                if (!this.type(itemValue, valueType.itemType, itemErrors)) {
                    let itemKey = value.keys()[i];
                    valid = false;
                    errors.push(`Item '${i}' errors: ` + itemErrors.join(', '));
                }
                i++;
            }

            return valid;
        } else if (valueType instanceof this.Enum_Type) {
            for (let value_Enum of valueType.values) {
                if (value === value_Enum)
                    return true;
            }

            errors.push(`Enum value '${value}' not found in '` + 
                    valueType.values.join(', ') + `'.`);
            return false;
        } else if (valueType instanceof this.Default_Type) {
            return false;
        } else if (valueType instanceof this.Iterable_Type) {
            if (!this.type(value, this.Iterable)) {
                errors.push(`Preset must be Iterable. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            let i = 0;
            for (let itemValue of value) {
                let itemErrors = [];
                if (!this.type(itemValue, valueType.itemType, itemErrors)) {
                    let itemKey = value.keys()[i];
                    valid = false;
                    errors.push(`Item '${i}' errors: ` + itemErrors.join(', '));
                }
                i++;
            }

            return valid;
        } else if (valueType instanceof this.Preset_Type) {
            if (typeofValue === 'undefined' && typeof 
                    valueType.defaultValue !== 'undefined') {
                value = valueType.defaultValue;
                typeofValue = typeof value;
            }

            if (value === null) {
                errors.push(`Preset cannot be null.`);
                return false;
            }

            if (typeofValue !== 'object') {
                errors.push(`Preset must be an object. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;

            for (let key in value) {
                if (!(key in valueType.presets)) {
                    errors.push(`Unknown key \`${key}\`.`);
                    valid = false;
                }
            }

            for (let key in valueType.presets) {
                let newErrors = [];
                
                if (typeof value[key] === 'undefined') {
                    if (valueType.presets[key] instanceof Array) {
                        for (let propValueType of valueType.presets[key]) {
                            if (propValueType instanceof this.Default_Type)
                                value[key] = propValueType.defaultValue;
                        }
                    }
                } 

                if (this.type(value[key], valueType.presets[key], newErrors))
                    continue;

                for (let newError of newErrors)
                    errors.push(`${key} -> ${newError}`);

                valid = false;
            }

            // console.log('WTF', value, valid, errors);

            return valid;
        } else if (valueType instanceof this.PresetArray_Type) {
            if (typeofValue === 'undefined' && typeof 
                    valueType.defaultValue !== 'undefined') {
                value = valueType.defaultValue;
                typeofValue = typeof value;
            }

            if (value === null) {
                errors.push(`Preset cannot be null.`);
                return false;
            }

            if (!(value instanceof Array)) {
                errors.push(`PresetArray must be an array. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            
            if (value.length !== valueType.presets.length) {
                errors.push(`Wrong PresetArray length. Required: '${valueType.presets.length}'.`);
                    valid = false;
            }

            for (let i = 0; i < valueType.presets.length; i++) {
                let newErrors = [];
                
                if (typeof value[i] === 'undefined') {
                    if (valueType.presets[i] instanceof Array) {
                        for (let propValueType of valueType.presets[i]) {
                            if (propValueType instanceof this.Default_Type)
                                value[i] = propValueType.defaultValue;
                        }
                    }
                } 

                if (this.type(value[i], valueType.presets[i], newErrors))
                    continue;

                for (let newError of newErrors)
                    errors.push(`${i} -> ${newError}`);

                valid = false;
            }

            return valid;
        } else if (valueType instanceof this.Prop_Type) {
            let propClass = valueType._propClass;
            if (typeof value !== 'object') {
                errors.push(`\`${value}\` does not implement \`${propClass}\` ` +
                        ` (not an object).`);
                return false;
            }

            if (!(propClass.Property in value)) {
                errors.push(`\`${value}\` does not implement \`${propClass}\` ` +
                        ` (property not in object).`);
                return false;
            }

            if (!(value[propClass.Property] instanceof propClass)) {
                errors.push(`\`${value}\` does not implement \`${propClass}\`. ` +
                        ` (wrong property type).`);
                return false;
            }

            return true;
        } else if (valueType === this.PropClass) {
            if (typeof value !== 'function') {
                errors.push(`\`${value}\` is not a \`Property\`.`);
                return false;
            }

            if (!('Property' in value)) {
                errors.push(`\`${value}\` is not a \`Property\`.`);
                return false;
            }

            return true;
        } else if (valueType instanceof this.Object_Type) {
            if (!this.type(value, this.Object)) {
                errors.push(`Preset must be an Object. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            for (let itemKey in value) {
                let itemErrors = [];
                if (!this.type(value[itemKey], valueType.itemType, itemErrors)) {
                    valid = false;
                    errors.push(`Item '${itemKey}' errors: ` + itemErrors.join(', '));
                }
            }

            return valid;
        } else if (valueType instanceof this.RawObject_Type) {
            if (!this.type(value, this.RawObject)) {
                errors.push(`Preset must be a RawObject. Found: ${typeofValue}.`);
                return false;
            }

            let valid = true;
            for (let itemKey in value) {
                let itemErrors = [];
                if (!this.type(value[itemKey], valueType.itemType, itemErrors)) {
                    valid = false;
                    errors.push(`Item '${itemKey}' errors: ` + itemErrors.join(', '));
                }
            }

            return valid;
        }
        /* / Special Types */

        let typeofValueType = typeof valueType;

        /* Basic Types */
        if (typeofValueType === 'string') {
            let result = true;
            if (this.Types_Basic.has(valueType)) {
                result = typeof value === valueType;
            } else if (this.Types_Extended.has(valueType)) {
                switch(valueType) {
                    case 'bool':
                        result = typeofValueType === 'boolean';
                    case 'int':
                        result = Number.isInteger(value);
                        break;
                    case 'finite':
                        result = Number.isFinite(value);
                        break;
                    case 'nan':
                        result = Number.isNaN(value);
                        break;
                }
            } else {
                errors.push(`Unknown type '${valueType}'.`);
                return false;
            }

            if (!result) {
                let typeof_value = typeof value;
                let value_Str = String(value);
                errors.push(`Variable \`${value_Str}\` of type \`${typeof_value}\`` +
                    ` should be of type \`${valueType}\`.`);
                return false;
            }

            return true;
        }

        if (typeofValueType === 'object') {
            /* Multiple Types */
            if (valueType instanceof Array) {
                if (value === null) {
                    for (let i = 0; i < valueType.length; i++) {
                        if (valueType[i] === this.NotNull) {
                            errors.push(`\`${value}\` cannot be \`null\`.`);
                            return false;
                        }
                    }
                }

                for (let i = 0; i < valueType.length; i++) {
                    if (this.type(value, valueType[i], errors))
                        return true;
                }

                return false;
            }

            return true;
        }

        if (typeofValueType === 'function') {
            // /* Property */
            // if ('Property' in valueType) {
            //     if (!this.implements(value, valueType)) {
            //
            //         errors.push(`Variable does not implement property
            //                 \`${valueType.constructor}\`.`);
            //         return false;
            //     }
            //
            //     return true;
            // }

            /* Class */
            if (!(value instanceof valueType)) {
                let valueStr = String(value);
                errors.push(`Variable \`${valueStr}\` is not an instance of` +
                        ` \`${valueType.name}\`.`);
                return false;
            }

            return true;
        }

        if (typeofValueType === 'symbol') {
            if (value !== valueType) {
                let value_Str = String(value);
                let valueType_Str = String(valueType);
                errors.push(`Variable '${valueStr}' is not ${valueType_Str}.`);
                return false;
            }

            return true;
        }

        throw new Error(`Unknown \`valueType\`: ${typeofValueType}`);
    }

    typeE(value, valueType)
    {
        let errors = [];
        if (this.type(value, valueType, errors))
            return;

        console.error('Error:', errors);
        throw new this.TypeError('Wrong variable type.');
    }

    virtual(object = null)
    {
        if (object === null)
            throw new this.NotImplementedError();

        throw new this.NotImplementedError(`Method not implemented in:` +
                ` \`${object.constructor.name}\`.`);
    }

}
const js0 = js0_Class.prototype;

Object.defineProperties(js0_Class.prototype, {

    /* Errors */
    AssertionError: { value:
    class js0_AssertionError extends Error
    {
        constructor(...args)
        {
            super(...args);
        }

    }},

    NotImplementedError: { value:
    class js0_NotImplementedError extends Error
    {

        constructor(...args)
        {
            super(...args);
        }

    }},


    TypeError: { value:
    class js0_TypeError extends Error
    {

        constructor(...args)
        {
            super(...args);

            // let stack = this.stack;
            // let stack_array = stack.split('\n');
            // stack_array.splice(1, 3);
            // this.stack = stack_array.join('\n');
        }

    }},
    /* / Errors */

    /* Types */
    Types_Basic: { value:
    new Set([
        'undefined',
        // 'object', /* null */
        'boolean',
        'number',
        'string',
        'symbol',
        'function',
        'object'
    ])},

    Types_Extended: { value:
    new Set([
        'bigint',
        'bool',
        'finite',
        'int',
        'nan'
    ])},

    /* Types Special */
    ArrayItems: { value: (itemType) => {
        return new js0.ArrayItems_Type(itemType);
    }},
    Default: { value: (defaultValue) => {
        return new js0.Default_Type(defaultValue);
    }},
    Enum: { value: (values) => {
        return new js0.Enum_Type(values);
    }},
    Int: { value: Symbol('js0_Int'), },
    Iterable: { value: (itemType) => {
        return new js0.Iterable_Type(itemType);
    }},
    Long: { value: Symbol('js0_Long'), },
    NotNull: { value: Symbol('js0_NotNull'), },
    NotSet: { value: Symbol('js0_NotSet'), },
    Null: { value: Symbol('js0_Null'), },
    Preset: { value: (presets, defaultValue = undefined) => {
        return new js0.Preset_Type(presets, defaultValue);
    }},
    PresetArray: { value: (presets, defaultValue = undefined) => {
        return new js0.PresetArray_Type(presets, defaultValue);
    }},
    Prop: { value: (property) => {
        return new js0.Prop_Type(property);
    }},
    PropClass: { value: Symbol('js0_PropClass'), },
    Object: { value: Symbol('js0_Object'), },
    RawObject: { value: Symbol('js0_RawObject'), },

    And_Type: { value:
    class js0_And_Type 
    {
        constructor(valueTypes)
        {
            js0.args(arguments, js0.PropClass);

            Object.defineProperties(this, {
                _valueTypes: { value: valueTypes, },
            });
        }

    }},

    ArrayItems_Type: { value:
    class js0_ArrayItems_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},

    Default_Type: { value:
    class js0_Default_Type {

        constructor(defaultValue = undefined)
        {
            this.defaultValue = defaultValue;
        }

    }},

    Enum_Type: { value:
        class js0_Enum_Type {
    
            constructor(values = [])
            {
                if (!(values instanceof Array))
                    throw new Error(`'js0.Enum' values must be an Array.`);

                this.values = values;
            }
    
        }},

    Iterable_Type: { value:
    class js0_Iterable_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},

    // Or_Type: { value:
    // class js0_Or_Type
    // {
    //     constructor(propClass)
    //     {
    //         js0.argsE(arguments, js0.PropClass);
    //
    //         Object.defineProperties(this, {
    //             _propClass: { value: propClass, },
    //         });
    //     }
    // }},

    Preset_Type: { value:
    class js0_Preset_Type {
        
        constructor(presets, defaultValue = undefined)
        {
            js0.args(arguments, [ 'object' ], [ 'object', null ]);

            this.presets = presets;
            this.defaultValue = defaultValue;
        }

    }},

    PresetArray_Type: { value:
    class js0_PresetArray_Type {
        
        constructor(presets)
        {
            js0.args(arguments, Array);

            this.presets = presets;
        }

    }},

    Prop_Type: { value:
    class js0_Prop_Type {

        constructor(propClass)
        {
            js0.args(arguments, js0.PropClass);

            Object.defineProperties(this, {
                _propClass: { value: propClass, },
            });
        }

    }},

    Object_Type: { value:
    class js0_Object_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},

    RawObject_Type: { value:
    class js0_RawObject_Type {

        constructor(itemType)
        {
            this.itemType = itemType;
        }

    }},
    /* / Types */

});


module.exports = new js0_Class();






 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\js0\TimeSpan.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-timer\index.js
jsLibs.exportModule('ab-timer', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Timer = require('./Timer')
;

class abTimer_Class
{

    get Timer() {
        return Timer;
    }


    constructor()
    {

    }

    start(runFn, interval)
    {
        js0.args(arguments, 'function', 'number');

        let t = new Timer(runFn, interval);
        t.start();

        return t;
    }

}
const abTimer = new abTimer_Class();



module.exports = abTimer;


 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-timer\Timer.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-time\index.js
jsLibs.exportModule('ab-time', 'index', (require, module, exports) => { 'use strict';

const
    abStrings = require('ab-strings'),
    js0 = require('js0')
;

class abTime_Class
{

    constructor()
    {
        
    }

    getParts(time)
    {
        js0.args(arguments, 'number');

        let parts = {};

        parts.h = Math.floor(time / (60 * 60 * 1000));
        time -= parts.h * 60 * 60 * 100;

        parts.m = Math.floor(time / (60 * 1000));
        time -= parts.m * 60 * 1000;

        parts.s = Math.floor(time / 1000);
        time -= parts.s * 1000;

        parts.ts = Math.floor(time / 100);

        return parts;
    }

    getTime()
    {
        return (new Date()).getTime();
    }
    
    // format_HMS(time, properties = {})
    // {
    //     js0.args(arguments, 'number', js0.Preset({
    //         alwaysShow: {
    //             h: [ 'boolean', js0.Default(false) ],
    //             m: [ 'boolean', js0.Default(false) ],
    //             s: [ 'boolean', js0.Default(false) ],
    //         },
    //         usePad: {
    //             h: [ 'boolean', js0.Default(false) ],
    //             m: [ 'boolean', js0.Default(false) ],
    //             s: [ 'boolean', js0.Default(false) ],
    //         },
    //     }))

    //     let time_Str = '';

    //     let h = Math.floor(time / (60 * 60));
    //     if (time_Str !== '' || h !== 0)
    //         time_Str += h + ':';
    //     time -= h * 60 * 60;

    //     let m = Math.floor(time / 60);
    //     if (time_Str !== '' || m !== 0)
    //         time_Str += abStrings.pad(m, '0', 2) + ':';
    //     time -= m * 60;

    //     let s = time;
    //     if (time_Str !== '' || s !== 0)
    //         time_Str += abStrings.pad(s, '0', 2) + ':';
        
    //     return time_Str;
    // }

}
const abTime = new abTime_Class();



module.exports = abTime;


 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-text\index.js
jsLibs.exportModule('ab-text', 'index', (require, module, exports) => { 'use strict'

const
    js0 = require('js0')
;

class abText_Class
{

    constructor()
    {
        this._texts = {};
        this._langAlias = null;
    }

    $(text, args = null)
    {
        js0.args(arguments, 'string', [ js0.Null, js0.RawObject, 
                js0.Default ]);

        if (this._langAlias === null) {
            console.warn('Lang alias not set.');
            return this.get(this._langAlias, text, args);
        }

        return this.get(this._langAlias, text, args);
    }

    add(langPrefix, texts)
    {
        js0.args(arguments, 'string', js0.RawObject);

        let langPrefix_Arr = langPrefix.split('.');
        let langAlias = langPrefix_Arr[0];
        let textPrefix_Arr = langPrefix_Arr.slice(1);
        let textPrefix = textPrefix_Arr.join('.');
        if (textPrefix !== '') {
            textPrefix += '.';
        }

        if (!(langAlias in this._texts)) {
            this._texts[langAlias] = {};
        }

        for (let text in texts) {
            this._texts[langAlias][textPrefix + text] = texts[text];
        }

        return this;
    }

    get(langAlias, text, args = null)
    {
        js0.args(arguments, [ js0.Null, 'string' ], 'string', [ js0.Null, 
                js0.RawObject, js0.Default ]);

        let translation = null;

        if (langAlias in this._texts) {
            if (text in this._texts[langAlias])
                translation = this._texts[langAlias][text];
        }

        if (translation === null) {
            if (args === null) {
                return `#${text}#`;
            } else if (Object.keys(args).length === 0) {
                return `#${text}#`;
            } else {
                let args_Arr = [];
                for (let argName in args) {
                    args_Arr.push(`${argName} => ${args[argName]}`);
                }
                return '#' + text + '(' + args_Arr.join(', ') + ')';
            }
        }

        for (let argName in args) {
            translation = translation.replace(new RegExp(`{${argName}}`, 'gm'), 
                    args[argName]);
        }

        return translation;
    }

    setLang(langAlias)
    {
        this._langAlias = langAlias;
    }

}
module.exports = new abText_Class();





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-resource-preloader\Preloader.js
jsLibs.exportModule('ab-resource-preloader', 'Preloader', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Preloader
{

    constructor(emptySrcs = {})
    {
        js0.args(arguments, [ js0.RawObject, js0.Default ]);

        js0.typeE(emptySrcs, js0.Preset({
            imageSrc: [ 'string', js0.Null, js0.Default(null), ],
            soundSrc: [ 'string', js0.Null, js0.Default(null), ],
        }));
        this._emptySrcs = emptySrcs;

        this._loadStarted = false;
        this._imageInfos = [];
        this._soundInfos = [];
        this._callback = null;
    }

    addImages(srcs)
    {
        js0.args(arguments, js0.Iterable('string'));

        for (let src of srcs) {
            this._imageInfos.push({
                src: src,
                image: null,
                loaded: false,
            });
        }

        return this;
    }

    addSounds(srcs)
    {
        js0.args(arguments, js0.Iterable('string'));

        for (let src of srcs) {
            this._soundInfos.push({
                src: src,
                sound: null,
                loaded: false,
            });
        }

        return this;
    }

    load(callback = null)
    {
        js0.args(arguments, [ 'function', js0.Default ]);

        this._callback = callback;

        if (this._loadStarted)
            throw new Error('Load already started.');
        this._loadStarted = true;

        // setTimeout(() => {
            this._load_Images();
            this._load_Sounds();
        // }, 1000);
        

        this._loadedCheck();
    }

    release()
    {
        this._loadStarted = false;
        
        this._release_Images();
        this._release_Sounds();

        this._callback = null;
    }


    _loadedCheck()
    {
        if (!this._loadedCheck_Images())
            return;
        if (!this._loadedCheck_Sounds())
            return;

        if (this._callback !== null)
            this._callback();
    }

    _loadedCheck_Images()
    {
        for (let info of this._imageInfos) {
            if (!info.loaded)
                return false;
        }

        return true;
    }

    _loadedCheck_Sounds()
    {
        for (let info of this._soundInfos) {
            if (!info.loaded)
                return false;
        }

        return true;
    }

    _load_Images()
    {
        for (let info of this._imageInfos) {
            info.image = new Image();
            info.image.onerror = (err) => {
                console.error('Error loading image:', info.src);
                info.loaded = true;
                this._loadedCheck();
            };
            info.image.onload = () => {
                info.loaded = true;
                this._loadedCheck();    
            };
            info.image.src = info.src;
        }
    }

    _load_Sounds()
    {
        for (let info of this._soundInfos) {
            info.sound = new Audio();
            info.sound.onerror = (err) => {
                console.error('Error loading sound:', info.src);
                info.loaded = true;
                this._loadedCheck();
            };
            info.sound.oncanplaythrough = () => {
                info.loaded = true;
                this._loadedCheck();    
            };
            info.sound.src = info.src;
        }
    }

    _release_Images()
    {
        for (let i = 0; i < this._imageInfos.length; i++) {
            if (this._emptySrcs.imageSrc !== null)
                this._imageInfos[i].image.src = this._emptySrcs.soundSrc;
            this._imageInfos[i].image = null;
        }

        this._imageInfos = [];
    }

    _release_Sounds()
    {
        
        for (let i = 0; i < this._soundInfos.length; i++) {
            if (this._emptySrcs.soundSrc !== null)
                this._soundInfos[i].sound.src = this._emptySrcs.soundSrc;
            this._soundInfos[i].sound = null;
        }

        this._soundInfos = [];
    }

}

module.exports = Preloader;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-resource-preloader\index.js
jsLibs.exportModule('ab-resource-preloader', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    Preloader = require('./Preloader')
;

class abPreloader_Class 
{

    get Preloader() {
        return Preloader;
    }


    constructor()
    {
        
    }

}
module.exports = new abPreloader_Class();





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-pager\Pager.js
jsLibs.exportModule('ab-pager', 'Pager', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class Pager
{

    get base() {
        return this._base;
    }

    get current() {
        return this._currentPageInfo;
    }

    get pages() {
        return this._pages;
    }


    constructor(base = '/', useState = true)
    {
        this._initialized = false;

        this._base = base;
        this._useState = useState;
        this._pages = new Map();

        this._currentPage = null;
        this._currentPageInfo = null;

        this._listeners_OnPageChanged = [];
        this._listeners_OnPageSet = {};
        this._listeners_OnBeforePageSet = [];

        this._listeners_NotFound = null;
    }

    addListener_OnBeforePageSet(listenerFn)
    {
        this._listeners_OnBeforePageSet.push(listenerFn);
    }

    getPage(pageName)
    {
        js0.args(arguments, 'string');

        if (!this._pages.has(pageName))
            throw new Error(`Page '${pageName}' does not exist.`);

        return this._pages.get(pageName);
    }

    getPageInfo_FromUri(uri)
    {
        if (this._pages.size === 0)
            throw new Error(`Cannot parse uri '${uri}'. No pages set.`);

        let base = this._base;
        base = base.substring(0, base.length);

        if (uri.indexOf(base) !== 0) {
            window.location = base;
            return null;
        }

        uri = uri.substring(base.length);
        
        let uriArr = uri.split('?');
        uri = uriArr[0];
        let search = uriArr.length === 1 ? '' : uriArr[1];

        let searchParams = {};
        let searchArr = search.split('&');
        for (let searchParam of searchArr) {
            let searchParamArr = searchParam.split('=');
            if (searchParamArr.length < 2)
                continue;
            
            searchParams[searchParamArr[0]] = searchParamArr[1];
        }

        let uriArray = uri.split('/');
        if (uriArray[uriArray.length - 1] === '')
            uriArray.pop();

        if (uriArray.length === 0)
            uriArray.push('');

        for (let [ pageName, page ] of this._pages) {
            let aliasArray = page.uri.split('/');

            if (aliasArray.length !== uriArray.length)
                continue;

            let args = {};
            let uriMatched = true;
            for (let i = 0; i < aliasArray.length; i++) {
                if (aliasArray[i] === '') {
                    uriMatched = uriArray[i] === '';
                    break;
                }

                if (aliasArray[i][0] === ':') {
                    if (aliasArray[i][0] === 1) {
                        uriMatched = false;
                        break;
                    }

                    let uriArgInfo = this._getUriArgInfo(aliasArray[i]);

                    args[uriArgInfo.name] = decodeURIComponent(uriArray[i]);
                    continue;
                }

                if (aliasArray[i] !== uriArray[i]) {
                    uriMatched = false;
                    break;
                }
            }

            if (!uriMatched)
                continue;

            return {
                name: page.name,
                args: args,
                searchParams: searchParams,
            };
        }

        return null;
    }

    getPageUri(pageName, args = {}, searchParams = {}, pathOnly = false)
    {
        js0.args(arguments, 'string', [ 'object', js0.Default ]);

        let page = this.getPage(pageName);

        return this.parseUri(page.uri, args, searchParams, null, null, pathOnly);
    }

    hasPage(pageName)
    {
        js0.args(arguments, 'string');

        return this._pages.has(pageName);
    }

    init(setPage = true)
    {
        this._initialized = true;

        if (this._useState) {
            window.onpopstate = () => {
                this._parseUri(window.location.pathname + window.location.search, false);
            };
        }

        let uri = window.location.pathname + window.location.search;
        let pageInfo = this.getPageInfo_FromUri(uri);
        if (!setPage)
            return pageInfo;

        this._setPageInfo(pageInfo, false, uri);
    }

    notFound(notFoundListener)
    {
        js0.args(arguments, 'function');

        this._listeners_NotFound = notFoundListener;
    }

    page(name, uri, onPageSetListener)
    {
        js0.args(arguments, 'string', 'string', 'function');

        this._pages.set(name, new Pager.Page(name, uri));
        
        if (onPageSetListener !== null) {
            this._listeners_OnPageSet[name] = onPageSetListener;
            // this._listeners_OnPageChanged.push((page, sourcePageName) => {
            //     if (page.name === name)
            //         onPageSetListener(sourcePageName);
            // });
        }

        return this;
    }

    parseUri(uri, args = {}, searchParams = {}, args_Parsed = null, 
            searchParams_Parsed = null, pathOnly = false)
    {   
        let uriArr = uri.split('?');
        uri = uriArr[0];

        /* Uri Args */
        let uriArgs = uri === '' ? [] : uri.split('/');
        if (uriArgs[uriArgs.length - 1] === '')
            uriArgs.pop();

        let pUri = '';
        for (let i = 0; i < uriArgs.length; i++) {
            if (uriArgs[i][0] !== ':') {
                pUri += uriArgs[i] + '/';
                continue;
            }

            let argInfo = this._getUriArgInfo(uriArgs[i]);

            if (!(argInfo.name in args)) {
                if (argInfo.defaultValue === null)
                    throw new Error(`Uri arg '${argInfo.name}' not set.`);

                pUri += argInfo.defaultValue + '/';
                args[argInfo.name] = argInfo.defaultValue;

                if (args_Parsed !== null)
                    args_Parsed[argInfo.name] = null;

                continue;
            }

            pUri += encodeURIComponent(args[argInfo.name]) + '/';

            if (args_Parsed !== null)
                args_Parsed[argInfo.name] = String(args[argInfo.name]);
        }

        /* Search Params */
        let search = '';
        for (let searchParam_Name in searchParams) {
            search += (search === '' ? '?' : '&') + searchParam_Name + '=' +
                    searchParams[searchParam_Name];
        }

        pUri += search;

        if (pathOnly)
            return pUri;
        else
            return this._base + pUri;
    }

    removeListener_OnBeforePageSet(listenerFn)
    {
        for (let i = 0; i < this._listeners_OnBeforePageSet.length; i++) {
            if (this._listeners_OnBeforePageSet[i] === listenerFn) {
                this._listeners_OnBeforePageSet.splice(i, 1);
                return;
            }
        }

        throw new Error(`Listener function does not exist.`);
    }

    setPage(pageName, args = {}, searchParams = {}, pushState = true, pageArgs = {})
    {
        js0.args(arguments, 'string', [ js0.Default, 'object' ], 
                [ js0.Default, 'object' ], [ js0.Default, 'boolean' ], 
                [ js0.Default, js0.RawObject ]);

        if (!this._pages.has(pageName))
            throw new Error('Page `' + pageName + '` does not exist.`');

        let args_Parsed = {};
        for (let argName in args)
            args_Parsed[argName] = String(args[argName]);
        args = args_Parsed;

        for (let listenerFn of this._listeners_OnBeforePageSet) {
            if (listenerFn(pageName, args, searchParams, pushState) === false)
                return;
        }

        let source = this._currentPage;
        this._currentPage = this._pages.get(pageName);

        let uri = this.parseUri(this._currentPage.uri, args, searchParams);

        this._currentPageInfo = new Pager.PageInfo(pageName, args, searchParams);

        if (this._useState) {
            if (pushState)
                window.history.pushState({}, this._currentPage.title, uri);
            else
                window.history.replaceState({}, this._currentPage.title, uri);
        }

        // let currentPage = {
        //     name: this._currentPageInfo.name,
        //     args: this._currentPageInfo.args,
        //     searchParams: this._currentPageInfo.searchParams,
        // };

        for (let i = 0; i < this._listeners_OnPageChanged.length; i++)
            this._listeners_OnPageChanged[i](this._currentPageInfo, source);
        if (this._currentPageInfo.name in this._listeners_OnPageSet) {
            this._listeners_OnPageSet[this._currentPageInfo.name](
                    this._currentPageInfo, source, pageArgs);

        }
    }

    setUri(uri, pushState = true)
    {
        this._parseUri(uri, pushState);
    }


    _getUriArgInfo(uriArg)
    {
        let argName = uriArg.substring(1);
        let argDefault = null;
        let argNameArray = argName.split('=');
        if (argNameArray.length > 1) {
            argName = argNameArray[0];
            argDefault = argNameArray[1];
        }

        return {
            name: argName,
            defaultValue: argDefault
        };
    }

    _parseUri(uri, pushState)
    {
        let pageInfo = this.getPageInfo_FromUri(uri);

        this._setPageInfo(pageInfo, pushState, uri);
    }

    _setPageInfo(pageInfo, pushState, uri)
    {
        js0.args(arguments, js0.RawObject, [ 'boolean', js0.Default ], 'string');

        if (pageInfo === null) {
            if (this._listeners_NotFound === null)
                throw new Error(`Cannot parse uri '${uri}'. No page found.`);
            else
                this._listeners_NotFound(uri, pushState);
        } else {
            this.setPage(pageInfo.name, pageInfo.args, pageInfo.searchParams, pushState);
        }
    }

}
module.exports = Pager;

Object.defineProperties(Pager, {
    
    Page: { value: 
    class Pager_Page {

        constructor(name, uri, onPageSetListener) {
            Object.defineProperties(this, {
                name: { value: name, },
                uri: { value: uri, },
                onPageSetListener: { value: onPageSetListener, },
            });
        }

    }},

    PageInfo: { value:
    class Pager_PageInfo {

        get args() {
            let argsR = {};
            for (let argName in this._args)
                argsR[argName] = this._args[argName];

            return argsR;
        }

        get name() {
            return this._name;
        }

        get searchParams() {
            let searchParamsR = {};
            for (let searchParamsName in this._searchParams)
                searchParams[searchParamsName] = this._searchParams[argName];

            return searchParamsR;
        }


        constructor(pageName, args, searchParams)
        {
            this._name = pageName;
            this._args = args;
            this._searchParams = searchParams;
        }
        
    }},

});





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-pager\index.js
jsLibs.exportModule('ab-pager', 'index', (require, module, exports) => { 'use strict';

const
    Pager = require('./Pager')
;

class abPager_Class
{

    get Pager() {
        return Pager;
    }


    constructor()
    {
            
    }
    
}
module.exports = new abPager_Class();





 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\NativeApp.js
jsLibs.exportModule('ab-native', 'NativeApp', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class NativeApp
{

    constructor()
    {
        
    }

    callNative(actionId, actionsSetName, actionInfo, args)
    {
        js0.args(arguments, 'int', 'string', js0.RawObject, js0.RawObject, 
                [ 'function', js0.Null, js0.Default ]);

        let errors = [];
        if (!js0.type(args, js0.Preset(actionInfo.actionArgs), errors)) {
            console.error(errors);
            throw new Error(`Wrong action '${actionInfo.name}' args.`);
        }
        
        this.__callNative(actionId, actionsSetName, actionInfo.name, args);
    }

    callWeb(actionId, actionsSetsName, actionInfo, args)
    {
        js0.args(arguments, 'int', 'string', js0.RawObject, js0.RawObject);

        let errors = [];
        if (!js0.type(args, js0.Preset(actionInfo.actionArgs), errors)) {
            console.error(errors);
            throw new Error(`Wrong action '${actionInfo.name}' args.`);
        }

        let fnResult = actionInfo.fn(args);
        if (js0.type(fnResult, Promise)) {
            fnResult
                .then((result) => {
                    this._callWeb_ParseResult(actionId, result);
                })
                .catch((err) => {
                    throw err;
                });
        } else {
            this._callWeb_ParseResult(actionId, fnResult);
        }

        this.__onWebResult(actionId, result);
    }
    
    _callWeb_ParseResult(actionId, actionInfo, result)
    {
        if (actionInfo.resultArgs === null) {
            if (!js0.type(result, js0.Null))
                throw new Error(`Wrong action '${actionInfo.name}' result. Expected: null.`);
        } else if (!js0.type(result, js0.Preset(actionInfo.resultArgs))) {
            console.error(errors);
            throw new Error(`Wrong action '${actionInfo.name}' result. Expected: ` + 
                    actionInfo.resultArgs);
        }

        this.__onWebResult(actionId, result);
    }

    _getNextActionId()
    {
        return ++this.actionId_Last;
    }


    __callNative(actionsSetName, actionName, args, callbackFn = null)
    {
        js0.args(arguments, 'string', 'string', js0.RawObject, 'function');
        js0.virtual(this);
    }

    __onWebResult()
    {
        js0.virtual(this);
    }

}

module.exports = NativeApp;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\ActionsSetDef.js
jsLibs.exportModule('ab-native', 'ActionsSetDef', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    abNative = require('.')
;

class ActionsSetDef
{

    constructor()
    {
        js0.args(arguments);

        this._actions_Native = {};
        this._actions_Web = {};
    }

    addNative(actionName, actionArgs, resultArgs)
    {
        js0.args(arguments, 'string', js0.RawObject, js0.RawObject);

        this._actions_Native[actionName] = {
            name: actionName,
            actionArgs: actionArgs,
            resultArgs: resultArgs,
        };

        return this;
    }

    addWeb(actionName, actionArgs, resultArgs, fn)
    {
        js0.args(arguments, 'string', js0.RawObject, js0.RawObject, 'function');

        this._actions_Web[actionName] = {
            name: actionName,
            actionArgs: actionArgs,
            resultArgs: resultArgs,
            fn: fn,  
        };

        return this;
    }

    // callNative(actionsSetName, actionName, actionArgs = {}, callbackFn = null)
    // {
    //     abNative.callNative(actionsSetName, actionName, actionArgs, callbackFn);
    // }

    // callNative_Async(actionName, actionArgs = {})
    // {
    //     return new Promise((resolve, reject) => {
    //         try {
    //             this.callNative(actionName, actionArgs, (result) => {
    //                 resolve(result);
    //             });
    //         } catch (e) {
    //             reject(e);
    //         }
    //     });
    // }

    getNativeInfo(actionName)
    {
        if (!(actionName in this._actions_Native))
            throw new Error(`Action '${actionName}' does not exist.`);

        return this._actions_Native[actionName];
    }

    getWebInfo(actionName)
    {
        if (!(actionName in this._actions_Web))
            throw new Error(`Action '${actionName}' does not exist.`);

        return this._actions_Web[actionName];
    }

    hasNative(actionName) {
        return actionName in this._actions_Native;
    }

    // init()
    // {
    //     abNative.init(this);
    // }

}

module.exports = ActionsSetDef;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\NativeActionsSet.js
jsLibs.exportModule('ab-native', 'NativeActionsSet', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    abNative = require('.')
;

class NativeActionsSet
{

    constructor(name, actionsSet)
    {
        js0.args(arguments, 'string', require('./ActionsSetDef'));

        this.name = name;
        this.actionsSet = actionsSet;
    }

    async callNative_Async(actionName, actionArgs = {})
    {
        return await abNative.callNative_Async(this.name, actionName, actionArgs);
    }

}

module.exports = NativeActionsSet;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\NativeApp_Android.js
jsLibs.exportModule('ab-native', 'NativeApp_Android', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    NativeApp = require('./NativeApp')
;

class NativeApp_Android extends NativeApp
{

    constructor()
    {
        super();
    }


    /* NativeApp */
    __callNative(actionId, actionsSetName, actionName, args)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);
        
        abNative_Android.callNative(actionId, actionsSetName, actionName, 
                JSON.stringify(args));
    }

    __onWebResult(actionId, result)
    {
        js0.args(arguments, 'int', [ js0.RawObject, js0.Null ]);

        abNative_Android.onWebResult(actionId, result);
    }
    /* / NativeApp */

}

module.exports = NativeApp_Android;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\NativeApp_IOS.js
jsLibs.exportModule('ab-native', 'NativeApp_IOS', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    NativeApp = require('./NativeApp')
;

class NativeApp_IOS extends NativeApp
{

    constructor()
    {
        super();
    }


    /* NativeApp */
    __callNative(actionId, actionsSetName, actionName, actionArgs)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);
        
        window.webkit.messageHandlers.abNative_IOS.postMessage({
            messageType: 'callNative',
            actionId: actionId, 
            actionsSetName: actionsSetName, 
            actionName: actionName, 
            actionArgs: actionArgs,
        });
    }

    __onWebResult(actionId, result)
    {
        js0.args(arguments, 'int', [ js0.RawObject, js0.Null ]);

        window.webkit.messageHandlers.abNative_IOS.postMessage({
            messageType: 'onWebResult',
            actionId: actionId,
            result: result,
        });
    }
    /* / NativeApp */

}

module.exports = NativeApp_IOS;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\WebApp.NativeActionsSet.js
jsLibs.exportModule('ab-native', 'WebApp.NativeActionsSet', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class NativeActionsSet
{

    constructor(actionsSetName, actionsSet)
    {
        js0.args(arguments, 'string', require('./WebApp.ActionsSet'));

        this.name = actionsSetName;
        this.actionsSet = actionsSet;
    }

    callWeb(actionName, args, callbackFn)
    {
        js0.args(arguments, 'string', js0.RawObject, callbackFn);

        this.webApp.callWeb(this.name, actionName, args, callbackFn);
    }

    callWeb_Async(actionName, args)
    {
        js0.args(arguments, 'string', js0.RawObject);

        return new Promise((resolve, reject) => {
            try {
                this.webApp.callWeb(this.name, actionName, args, (result) => {
                    resolve(result);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

}

module.exports = NativeActionsSet;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\NativeApp_Web.js
jsLibs.exportModule('ab-native', 'NativeApp_Web', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    NativeApp = require('./NativeApp')
;

class NativeApp_Web extends NativeApp 
{

    constructor()
    {
        super();
    }

    
    /* NativeApp */
    __callNative(actionId, actionsSetName, actionName, args)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);
        abNative_WebApp.callNative(actionId, actionsSetName, actionName, args);
    }

    // __onWebResult(actionId, result)
    // {
    //     abNative_WebApp.onWebResult(actionId, result);
    // }
    /* / NativeApp */
}

module.exports = NativeApp_Web;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\WebApp.ActionsSet.js
jsLibs.exportModule('ab-native', 'WebApp.ActionsSet', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

'use strict';

class ActionsSet
{

    constructor(webApp)
    {
        js0.args(arguments, require('./WebApp'));

        this.webApp = webApp;

        this._actions_Native = {};
    }

    addNative(actionName, fn)
    {
        js0.args(arguments, 'string', 'function');

        this._actions_Native[actionName] = {
            fn: fn,
        };
    }

    callWeb(actionsSetName, actionName, args, callbackFn)
    {
        js0.args(arguments, 'string', js0.RawObject, callbackFn);

        this.webApp.callWeb(actionsSetName, actionName, args, callbackFn);
    }

    hasNative(actionName)
    {
        return actionName in this._actions_Native;
    }

    getNativeInfo(actionName)
    {
        if (!(actionName in this._actions_Native))
            abNative.errorNative(`Action '${actionName}' does not exist.`);

        return this._actions_Native[actionName];
    }

}

module.exports = ActionsSet;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\WebApp.js
jsLibs.exportModule('ab-native', 'WebApp', (require, module, exports) => { 'use strict';

const
    js0 = require('js0'),

    ActionsSet = require('./WebApp.ActionsSet'),
    NativeActionsSet = require('./WebApp.NativeActionsSet')
;

class WebApp
{

    static get ActionsSet() {
        return ActionsSet;
    }


    constructor()
    {
        this._actionsSets = {};
        this._onResultListeners = {};

        this._actionId_Last = 0;
    }

    addActionsSet(actionsSetName, actionsSet)
    {
        js0.args(arguments, 'string', require('./WebApp.ActionsSet'));

        this._actionsSets[actionsSetName] = actionsSet;

        return new NativeActionsSet(actionsSetName, actionsSet);
    }

    callNative(actionId, actionsSetName, actionName, args, callbackFn)
    {
        let actionsSet = this.getActionsSet(actionsSetName);
        if (!actionsSet.hasNative(actionName))
            throw new Error(`Action '${actionName}' does not exist in Actions Set '${actionsSetName}'.`);
        let actionInfo = actionsSet.getNativeInfo(actionName);

        let result = actionInfo.fn(args);
        abNative.onNativeResult(actionId, result);
    }

    callWeb(actionsSetsName, actionName, args, callbackFn = null)
    {   
        let actionId = ++this._actionId_Last;
        this._onResultListeners[actionId] = callbackFn;
        abNative.callWeb(actionId, actionsSetsName, actionName, args);
    }

    createActionsSet(actionsSetName)
    {
        return new ActionsSet(this, actionsSetName);
    }

    getActionsSet(actionsSetName)
    {
        if (!(actionsSetName in this._actionsSets))
            throw new Error(`Actions Set '${actionsSetName}' does not exist.`);

        return this._actionsSets[actionsSetName];
    }

    onWebResult(actionId, result)
    {
        this._onResultListeners[actionId](result);
        delete this._onResultListeners[actionId];
    }

}

module.exports = WebApp;
exports = module.exports;




 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-native\index.js
jsLibs.exportModule('ab-native', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abNative_Class
{

    get ActionsSetDef() {
        return require('./ActionsSetDef');
    }

    get WebApp() {
        return require('./WebApp');
    }


    constructor()
    {
        this.nativeApp = null;

        this._actionsSets = {};
        this._initialized = false;

        this._actionId_Last = 0;
        this._onResultInfos = {};
    }

    addActionsSet(actionsSetName, actionsSet)
    {
        const 
            NativeActionsSet = require('./NativeActionsSet')
        ;

        js0.args(arguments, 'string', require('./ActionsSetDef'));

        let nativeActionsSet = new NativeActionsSet(actionsSetName, actionsSet);

        this._actionsSets[actionsSetName] = actionsSet;

        return nativeActionsSet;
    }

    // createActionsSet(actionsSetName)
    // {
    //     js0.args(arguments, 'string');

    //     return new NativeActionsSet(name);
    // }

    callNative_Async(actionsSetName, actionName, args = {}, callbackFn = null)
    {
        js0.args(arguments, 'string', 'string', [ js0.RawObject, js0.Default ], [ 'function', 
                js0.Null, js0.Default ]);

        return new Promise((resolve, reject) => {
            try {
                this._callNative(actionsSetName, actionName, args, (result) => {
                    resolve(result);
                });
            } catch (e) {
                reject(e);
            }
        });
    }

    callWeb(actionId, actionsSetName, actionName, args)
    {
        js0.args(arguments, 'int', 'string', 'string', js0.RawObject);

        if (this.nativeApp === null)
            throw new Error('Platform not set.');

        if (!this._initialized)
            throw new Error(`'abNative' has not been initialized.`);

        this.nativeApp.callWeb(actionId, actionsSetName, 
                this.getActionSet(actionsSetName).getWebInfo(actionName), args);
    }

    errorNative(message)
    {
        console.error('Native error:', message);
    }

    getActionInfo(actionsSetName, actionName)
    {
        if (!(actionName in nativeActions.actions_Web))
            throw new Error(`Action '${actionName}' does not exist.`);
    }

    getActionSet(actionsSetName)
    {
        if (!(actionsSetName in this._actionsSets))
            throw new Error(`Actions Set '${actionsSetName}' does not exist.`);

        return this._actionsSets[actionsSetName];
    }

    init(platform)
    {
        js0.args(arguments, js0.Enum([ 'web', 'android', 'ios' ]));

        if (platform === 'web')
            this.nativeApp = new (require('./NativeApp_Web'))();
        else if (platform === 'android')
            this.nativeApp = new (require('./NativeApp_Android'))();
        else if (platform === 'ios')
            this.nativeApp = new (require('./NativeApp_IOS'))();

        this._initialized = true;
        // this.nativeApp.init();
    }

    onNativeResult(actionId, result)
    {
        let actionInfo = this._onResultInfos[actionId].actionInfo;

        let parseResultFn = (result) => {
            if (actionInfo.resultArgs !== null) {
                let errors = [];
                if (!js0.type(result, js0.Preset(actionInfo.resultArgs), errors)) {
                    console.error('Result:', result);
                    console.error(errors);
                    throw new Error(`Wrong action '${actionInfo.name}' result.`);
                }
            }
    
            if (this._onResultInfos[actionId].callbackFn !== null)
                this._onResultInfos[actionId].callbackFn(result);
            delete this._onResultInfos[actionId];
        };

        if (result instanceof Promise) {
            result
                .then((result) => {
                    parseResultFn(result);
                })
                .catch((e) => {
                    console.error('Cannot parse native result promise:');
                    console.error(e);
                });
        } else 
            parseResultFn(result);
    }

    setPlatform(platform)
    {
        js0.args(arguments, js0.Enum([ 'web', 'android', 'ios' ]));

        console.log('Platform set: ' + platform);

        this.init(platform);
    }


    _callNative(actionsSetName, actionName, args = {}, callbackFn = null)
    {
        js0.args(arguments, 'string', 'string', [ js0.RawObject, js0.Default ], [ 'function', 
                js0.Null, js0.Default ]);

        if (this.nativeApp === null)
            throw new Error('Platform not set.');

        if (!this._initialized)
            throw new Error(`'abNative' has not been initialized.`);

        if (!this.getActionSet(actionsSetName).hasNative(actionName)) {
            throw new Error(`Action '${actionName}' does not exist in Actions Set '${actionsSetName}'.`);
        }
        let actionInfo = this.getActionSet(actionsSetName).getNativeInfo(actionName);

        let actionId = ++this._actionId_Last;
        this._onResultInfos[actionId] = {
            actionInfo: actionInfo,
            callbackFn: callbackFn,
        };

        this.nativeApp.callNative(actionId, actionsSetName, actionInfo, args);
    }

}
const abNative = new abNative_Class();



module.exports = abNative;


 });

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-date\index.js
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

// File: C:\SfTd\AllBlue\Projects\Rocko\git\allblue_rocko_betas_app\electron\web-app\tmp\ab-web\js-libs\ab-cookies\index.js
jsLibs.exportModule('ab-cookies', 'index', (require, module, exports) => { 'use strict';

const
    js0 = require('js0')
;

class abCookies_Class
{

    delete(name)
    {

    }

    exists(name)
    {
        return this.getString(name) !== null;
    }

    get(name, defaultValue = undefined)
    {   
        let cookieStr = this.getString(name);
        if (cookieStr === null) {
            if (typeof defaultValue !== undefined)
                return defaultValue;

            throw new Error(`Cookie '${name}' does not exist.`)
        }
        try {
            let cookieJSON = JSON.parse(decodeURIComponent(cookieStr));

            return cookieJSON.value;
        } catch (err) {
            console.error(err);
            throw new Error('AB Cookie not properly formatted.');
        }
    }

    getString(name)
    {
        var cookieName = name + "=";
        var cookieStrsArr = document.cookie.split(';');
        for (let cookieStr of cookieStrsArr) {
            while (cookieStr.charAt(0) === ' ')
                cookieStr = cookieStr.substring(1);
            if (cookieStr.indexOf(name) !== 0)
                continue;

            return cookieStr.substring(name.length + 1, cookieStr.length);
        }

        return null;
    }

    set(name, value, settings = {})
    {
        js0.args(arguments, 'string', null, 
                js0.Preset({
            expires: [ 'number', js0.Null, js0.Default(null), ],
            domain: [ 'string', js0.Null, js0.Default(null), ],
            path: [ 'string', js0.Default('/'), ],
        }, settings));

        let cookieStr = '';
        /* Value */
        cookieStr += name + '=' + encodeURIComponent(JSON.stringify({ value: value })) + '; ';
        /* Path */
        cookieStr += `path=` + settings.path + '; ';
        /* Expires */
        if (settings.expires !== null) {
            let expiresTime = Math.round((new Date()).getTime() / 1000) + settings.expires;
            cookieStr += 'expires=' + (new Date(expiresTime * 1000)).toUTCString() + '; ';
        }
        /* Domain */
        if (settings.domain !== null) {
            cookieStr += 'domain=' + settings.domain + '; ';
        }

        document.cookie = cookieStr;
    }

}
const abCookies = new abCookies_Class();



module.exports = abCookies;


 });
