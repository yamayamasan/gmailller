const { app, BrowserWindow, ipcMain } = require('electron');
const url = require('url');
const _ = require('lodash');

const Logger = require('./libs/logger');
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

  logger.log(win, ['test']);

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
    const currentSize = win.getSize();
    if (arg.height && arg.width) {
      // if ((arg.height !== currentSize[1]) || (arg.width !== currentSize[0])) {
      //   win.setSize(currentSize[0], currentSize[1]);
      // } else {
      win.setSize(arg.width, arg.height);
      // }
    }
    if (arg.resizable) {
      win.setResizable(arg.resizable);
    }
  }
  ev.sender.send('window:resize:end', true);
});

// loki
const Loki = require('./libs/lokiDb');
const loki = new Loki('./lokidb/db.json', ['user', 'mailboxes', 'mails']);

// gmail
const GmailClient = require('./libs/gmail_client');
const gmailclient = new GmailClient(ipcMain, loki);

// state
const State = require('./libs/state');
const state = new State(ipcMain);