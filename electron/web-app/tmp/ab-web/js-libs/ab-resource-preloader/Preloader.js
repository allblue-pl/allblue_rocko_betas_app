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