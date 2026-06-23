const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    loadState: () => ipcRenderer.invoke('load-state'),
    saveState: (state) => ipcRenderer.send('save-state', state)
});
