
const
    electron = require('electron')
;

let win = null;

const createWindow = () => {
    win = new electron.BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      },
    });
  
    win.setMenu(null);
    win.loadFile('index.html');
}

electron.app.whenReady().then(() => {
    createWindow();

    electron.app.on('activate', () => {
        if (electron.BrowserWindow.getAllWindows().length === 0) 
            createWindow();
    });

    electron.app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') 
            electron.app.quit()
    });
});

electron.ipcMain.on('BoulderBetas_Clip_Create', (evt, dBoulderBetas, clipFilePath) => {
    let clipsHelper = require('./system/clipsHelper');
    
    (async () => {
        let result = await clipsHelper.createClip_Async(dBoulderBetas, 
                clipFilePath);
        evt.sender.send('BoulderBetas_Clip_Created', result);
    })();
});

electron.ipcMain.on('BoulderBetas_ClipLocation_Select', (evt) => {
    electron.dialog.showSaveDialog({
        filters: [
            { name: 'Movies', extensions: [ 'mp4' ], },
        ],
        properties: [ 'createDirectory', ],
    }).then((result) => {
        if (!result.canceled)
            evt.sender.send('BoulderBetas_ClipLocation_Selected', result.filePath);
    }).catch((err) => {
        console.error(err);
    });
});

electron.ipcMain.on('BoulderBetas_SelectFiles', (evt) => {
    electron.dialog.showOpenDialog({
        filters: [
            { name: 'Movies', extensions: [ 'mp4', 'mov' ], },
        ],
        properties: [ 'createDirectory', 'multiSelections', 'openFile', ],
    }).then((result) => {
        if (!result.canceled)
            evt.sender.send('BoulderBetas_FilesSelected', result.filePaths);
    }).catch((err) => {
        console.error(err);
    });
});

electron.ipcMain.on('BoulderBetas_QRCodes_Create', (evt, clipInfos,
        ytLink, qrCodesFilePath) => {
    let qrCodesHelper = require('./system/qrCodesHelper');
    
    (async () => {
        await qrCodesHelper.createQRCodes_Async(clipInfos, ytLink, qrCodesFilePath);
        evt.sender.send('BoulderBetas_QRCodes_Created');
    })();
});

electron.ipcMain.on('BoulderBetas_QRCodesLocation_Select', (evt) => {
    electron.dialog.showSaveDialog({
        filters: [
            { name: 'Images', extensions: [ 'png' ], },
        ],
        properties: [ 'createDirectory', ],
    }).then((result) => {
        if (!result.canceled)
            evt.sender.send('BoulderBetas_QRCodesLocation_Selected', result.filePath);
    }).catch((err) => {
        console.error(err);
    });
});

electron.ipcMain.on('Debug_OpenConsole', (evt) => {
    win.webContents.openDevTools();
});