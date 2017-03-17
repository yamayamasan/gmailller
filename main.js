const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');

const config = require('./config/app.json');

let win = null;

function createWindow() {
  win = new BrowserWindow(config.default);
  win.loadURL(url.format({
    pathname: `${__dirname}/src/index.html`,
    protocol: 'file:',
    slashes: true,
  }));

  win.on('closed', () => {
    console.log('closed');
    win = null;
  });

  win.on('resize', (a) => {
    console.log('resized:', win.getSize());
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

// resize
ipcMain.on('window:resize:start', (event, arg) => {
  if (arg) {
    if (arg.height && arg.width) {
      win.setSize(arg.width, arg.height);
    }
    if (arg.resizable) {
      win.setResizable(arg.resizable);
    }
  }
  event.sender.send('window:resize:end', true);
});