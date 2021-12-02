
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

        this.l = new $layouts.Main();

        this.msgs = new spkMessages.Messages();
        this.l.$holders.msgs.$views = this.msgs;

        this.setView_Start();

        this.l.$elems.CreateBoulderBetasVideo.addEventListener('click', (evt) => {
            evt.preventDefault();
            electron.ipcRenderer.send('BoulderBetas_SelectFiles');
            electron.ipcRenderer.on('BoulderBetas_FilesSelected', (evt, filePaths) => {
                this.setView_BoulderBetas(filePaths);
            });
        });

        this.l.$elems.CreateClip.addEventListener('click', (evt) => {
            evt.preventDefault();
            electron.ipcRenderer.send('BoulderBetas_ClipLocation_Select');
            electron.ipcRenderer.on('BoulderBetas_ClipLocation_Selected', 
                    (evt, clipFilePath) => {
                this.setView_CreatingClip();
                electron.ipcRenderer.send('BoulderBetas_Clip_Create', 
                        this._dBoulderBetas, clipFilePath);
                electron.ipcRenderer.on('BoulderBetas_Clip_Created', 
                        (evt, ytDescription) => {
                    this.setView_ClipCreated(ytDescription);
                });
            });
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
        }

        this.l.$fields.BoulderBetas = this._dBoulderBetas;
        this.l.$fields.Display = 'BoulderBetas';

        let sortable = Sortable.create(this.l.$elems.BoulderBetas);
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

    setView_Start()
    {
        this._dBoulderBetas = [];
        this.l.$fields.BoulderBetas = [];
        this.l.$fields.Display = 'Start';
    }


}
module.exports = Main;