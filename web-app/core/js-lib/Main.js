
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

        this.l.$elems.YTLink.value = '';

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