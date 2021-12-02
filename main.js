
const
    electron = require('electron')
;

const createWindow = () => {
    const win = new electron.BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
      },
    });
  
    win.setMenu(null);
    win.loadFile('index.html');

    win.webContents.openDevTools();
}

electron.app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
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
        let ytDescription = await clipsHelper.createClip_Async(dBoulderBetas, 
                clipFilePath);
        evt.sender.send('BoulderBetas_Clip_Created', ytDescription);
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
            { name: 'Movies', extensions: [ 'mp4' ], },
        ],
        properties: [ 'createDirectory', 'multiSelections', 'openFile', ],
    }).then((result) => {
        if (!result.canceled)
            evt.sender.send('BoulderBetas_FilesSelected', result.filePaths);
    }).catch((err) => {
        console.error(err);
    });
});