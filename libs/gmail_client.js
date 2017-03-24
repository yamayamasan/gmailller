const _ = require('lodash');
const Gmail = require('./gmail');
const notifier = require('node-notifier');
const crypto = require('crypto');

class GmailClient {

  constructor(ipcMain, db) {
    this.ipc = ipcMain;
    this.instance = {};
    this.cache = {};
    this.actions();

    const actions = [
      'authGmail',
      'connection',
      'listMailboxes',
      'unreadlistMailboxes',
      'getMailbox',
      'getMessage',
      'addFlags',
      'observer',
      'readMail',
      'postMessage',
    ];
    actions.forEach((action) => {
      const syncAction = `${action}Sync`;
      if (this[action]) {
        this[action]();
      }
      if (this[syncAction]) {
        this[syncAction]();
      }
    });
  }

  send(ev, action, params) {
    ev.sender.send(`gmail:${action}:res`, params);
  }

  ipcon(action, cb) {
    this.ipc.on(`gmail:${action}`, (ev, arg) => {
      cb(ev, arg.key, arg.params);
    });
  }

  authGmailSync() {
    this.ipcon('authGmail.sync', async(ev) => {
      const tmp = new Gmail();
      ev.returnValue = tmp.authGmail();
    });
  }

  connection() {
    this.ipcon('connection', async(ev, key, params) => {
      await this.connect(key, params);
      this.send(ev, 'connection', key);
    });
  }

  connected(action, cb) {
    this.ipc.on(`gmail:${action}`, async(ev, arg) => {
      const key = arg.key || 'main';
      if (!this.hasConnect(key)) {
        await this.connect(key, arg.params);
      }
      const res = await cb(ev, key, arg.params, this.instance[key]);
      this.send(ev, action, res);
    });
  }

  listMailboxes() {
    this.connected('listMailboxes', async(ev, key, params, instance) => {
      const listMailboxes = await instance.listMailboxes();
      this.closeConnectOtMain(key);
      return listMailboxes;
    });
  }

  unreadlistMailboxes() {
    this.connected('unreadlistMailboxes', async(ev, key, params, instance) => {
      const listMailboxes = await instance.listMailboxes();
      for (let i = 0; i < listMailboxes.length; i++) {
        const mail = listMailboxes[i];
        if (mail.name.match(/Mailbox|Gmail|Airmail/) == null) {
          const count = await instance.countUnRead(mail.path);
          listMailboxes[i].unreadCount = (count > 99) ? '+99' : count;
        }
      }
      this.closeConnectOtMain(key);
      return listMailboxes;
    });
  }

  getMailboxSync() {
    this.ipcon('getMailbox.sync', async(ev, key, params) => {
      const orglistMails = params.listMails;
      const mailbox = params.mailbox;
      const from = params.from;

      const addlistMails = await this.instance.main.listMessages(mailbox.path, from);
      const rAddlistMails = _.reverse(addlistMails);
      const res = orglistMails.concat(rAddlistMails);
      this.cache['mailboxes'] = res;
      ev.returnValue = res;
    });
  }

  getMailbox() {
    this.connected('getMailbox', async(ev, key, params, instance) => {
      const orglistMails = params.listMails;
      const mailbox = params.mailbox;
      const from = params.from;

      const addlistMails = await instance.listMessages(mailbox.path, from);
      const rAddlistMails = _.reverse(addlistMails);
      return orglistMails.concat(rAddlistMails);
    });
  }

  readMail() {
    this.connected('readMail', async(ev, key, params, instance) => {
      const add = await instance.addFlags(params.uid, ['\\Seen']);
      return { uid: params.uid, flags: add };
    });
  }

  getMessageSync() {
    this.ipcon('getMessage.sync', async(ev, key, params) => {
      if (!this.hasConnect(key)) {
        await this.connect(key, params);
      }
      const mail = await this.instance[key].getMessage(params.uid);
      ev.returnValue = mail;
    });
  }

  addFlags() {
    this.connected('addFlags', async(ev, key, params, instance) => {
      const flags = await instance.addFlags(params.uid, params.flags);
      return {
        uid: params.uid,
        flags,
      };
    });
  }

  postMessage() {
    this.connected('addFlags', async(ev, key, params, instance) => {
      const store = await instance.postMessage(params.from, params.message);
      return store;
    });
  }

  actions() {
    this.ipc.on('gmail:observer', async(ev, arg) => {
      const key = arg.key;
      const params = arg.params;
      if (!this.hasConnect(key)) {
        await this.connect(key, params);
      }
      this.instance[key].observe((message) => {
        // notifier.notify({
        //   title: message.from.name,
        //   message: message.title,
        //   sound: true,
        //   wait: true,
        // }, (err, response) => {
        //   console.log(response);
        // });
        console.log(message);
      });
    });

    this.ipc.on('gmail:getMessage', async(ev, arg) => {
      const key = arg.key;
      const params = arg.params;

      const mail = await this.instance[key].getMessage(params.uid);
      ev.sender.send('gmail:getMessage:res', mail);
    });

    this.ipc.on('gmail:disconnected', async(ev, arg) => {
      const key = arg.key;

      console.log('gmail:disconnected1');
      this.instance[key].disconnected(() => {
        console.log('gmail:disconnected');
        ev.sender.send('gmail:disconnected:res', true);
      });
    });

    this.ipc.on('gmail:close', async(ev, arg) => {
      const key = arg.key;

      this.closeConnect(key);
    });
  }

  closeConnect(key) {
    this.instance[key].close();
    this.instance = _.omit(this.instance, key);
  }

  /**
   * main以外の場合close connet
   * 
   * @param {any} key 
   * 
   * @memberOf GmailClient
   */
  closeConnectOtMain(key) {
    if (key !== 'main') {
      this.closeConnect(key);
    }
  }

  hasConnect(key) {
    return !_.isUndefined(this.instance[key]);
  }

  async connect(key, params) {
    this.instance[key] = new Gmail();
    this.instance[key].setOauthConfig(params.auth.user, params.auth);
    await this.instance[key].createConnection();
  }

  static getHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

module.exports = GmailClient;