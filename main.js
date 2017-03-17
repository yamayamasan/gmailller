const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const _ = require('lodash');

const Logger = require('./src/js/libs/logger');
const logger = new Logger();

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
    logger.log('closed');
    win = null;
  });

  win.on('resize', (a) => {
    logger.log('resized:', win.getSize());
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
ipcMain.on('window:resize:start', (ev, arg) => {
  if (arg) {
    if (arg.height && arg.width) {
      win.setSize(arg.width, arg.height);
    }
    if (arg.resizable) {
      win.setResizable(arg.resizable);
    }
  }
  ev.sender.send('window:resize:end', true);
});

// re:state
const state = {
  data: {},
  get: function(key) {
    return this.data[key];
  },
  set: function(key, val) {
    this.data[key] = val;
  },
  has: function(key) {
    return this.data[key] ? true : false;
  },
};

ipcMain.on('state:init', (ev, arg) => {
  _.forEach(arg, (val, key) => {
    state.set(key, val);
  });
});

ipcMain.on('state:set', (ev, arg) => {
  const key = Object.keys(arg)[0];
  state.set(key, arg[key]);

  ev.sender.send('state:set:res', arg);
});

ipcMain.on('state:get', (ev, arg) => {
  const key = arg.key;
  const def = arg.def;
  const data = state.has(key) ? state.get(key) : def;

  ev.returnValue = data;
});