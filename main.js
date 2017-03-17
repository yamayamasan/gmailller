const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');

const config = {
  windowSize: { width: 800, height: 600 },
};

let win = null;

function createWindow() {
  win = new BrowserWindow(config.windowSize);
  win.loadURL(url.format({
    pathname: `${__dirname}/src/index.html`,
    protocol: 'file:',
    slashes: true,
  }));

  win.on('closed', () => {
    console.log('closed');
    win = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});