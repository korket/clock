const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const stateFile = path.join(app.getPath('userData'), 'clock-state.json');

ipcMain.handle('load-state', () => {
    try {
        if (fs.existsSync(stateFile)) {
            return JSON.parse(fs.readFileSync(stateFile, 'utf8'));
        }
    } catch (e) {}
    return null;
});

ipcMain.on('save-state', (event, state) => {
    try {
        fs.writeFileSync(stateFile, JSON.stringify(state));
    } catch (e) {}
});

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 500,
        height: 540,
        minWidth: 360,
        minHeight: 400,
        backgroundColor: '#F5F5F7',
        titleBarStyle: 'hiddenInset',
        titleBarOverlay: {
            color: '#ECECEC',
            symbolColor: '#1D1D1F',
            height: 32,
        },
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        show: false, // Show after ready to avoid flash
        icon: path.join(__dirname, 'icon.png'),
    });

    // Remove the menu bar
    mainWindow.setMenuBarVisibility(false);

    // Load the app
    mainWindow.loadFile('index.html');

    // Show when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
