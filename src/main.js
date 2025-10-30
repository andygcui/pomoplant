/*
require('electron-reload')(__dirname, {
  electron: require(`${__dirname}/../node_modules/electron`),
  hardResetMethod: 'exit'
});
*/

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 400,
    height: 500,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile(path.join(__dirname, 'index.html'));
  // Optional: win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})


app.on('window-all-closed', () => {
  // On macOS, it's common for applications to stay active until the user quits explicitly
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



