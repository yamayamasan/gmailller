const Mail = require(`${LIBS_DIR}/mail`);
const mailLib = new Mail();

class Gmailler {

  constructor(communicator) {
    this.comm = communicator;
  }

  authGmailSync() {
    return this.sendSync('authGmail');
  }

  connection(key, params, cb = null) {
    this.send('connection', key, params);
    if (cb !== null) {
      this.onConnection(cb);
    }
  }

  onConnection(cb) {
    this.on('connection', cb);
  }

  listMailboxes(key, params, cb = null) {
    this.send('listMailboxes', key, params);
    if (cb !== null) {
      this.onListMailboxes(cb);
    }
  }

  onListMailboxes(cb) {
    this.on('listMailboxes', cb);
  }

  unreadlistMailboxes(key, params, cb = null) {
    this.send('unreadlistMailboxes', key, params);
    if (cb !== null) {
      this.onUnreadlistMailboxes(cb);
    }
  }

  onUnreadlistMailboxes(cb) {
    this.on('unreadlistMailboxes', cb);
  }

  getMailboxSync(key, params) {
    return this.sendSync('getMailbox', key, params);
  }

  getMailbox(key, params, cb = null) {
    this.send('getMailbox', key, params);
    if (cb !== null) {
      this.onGetMailbox(cb);
    }
  }

  onGetMailbox(cb) {
    this.on('getMailbox', cb);
  }

  getMessageSync(key, params) {
    return this.sendSync('getMessage', key, params);
  }

  getMessage(key, params, cb = null) {
    this.send('getMessage', key, params);
    if (cb !== null) {
      this.onGetMessage(cb);
    }
    return this;
  }

  onGetMessage(cb) {
    this.on('getMessage', cb);
  }

  addFlags(key, params, cb = null) {
    this.send('addFlags', key, params);
    if (cb !== null) {
      this.onAddFlags(cb);
    }
    return this;
  }

  onAddFlags(cb) {
    this.on('addFlags', cb);
  }

  observer(key, params, cb = null) {
    this.send('observer', key, params);
    if (cb !== null) {
      this.onObserver(cb);
    }
    return this;
  }

  onObserver(cb) {
    this.on('observer', cb);
  }

  readMail(key, params, cb = null) {
    this.send('readMail', key, params);
    if (cb !== null) {
      this.onReadMail(cb);
    }
    return this;
  }

  onReadMail(cb) {
    this.on('readMail', cb);
  }

  send(action, key, params) {
    this.comm.send(`gmail:${action}`, {
      key,
      params,
    });
  }

  on(action, cb) {
    this.comm.on(`gmail:${action}:res`, (ev, response) => {
      cb(response, ev);
    });
  }

  sendSync(action, key = null, params = null) {
    return this.comm.sendSync(`gmail:${action}.sync`, {
      key,
      params,
    });
  }

  getMailByUid(key, uid) {
    return (async() => {
      const params = { uid };
      let mail = await db.get('mails', params);
      if (!mail) {
        const orgMail = this.getMessageSync('main', params);
        const parse = await mailLib.bodyParse(orgMail);
        const pick = _.pick(parse, ['subject', 'text', 'html', 'content', 'messageId', 'from', 'to', 'date']);
        mail = _.merge(pick, {
          uid,
          read: true,
        });
        db.put('mails', mail);
        this.readMail('readMail', { uid, flags: ['\\Seen'] });
      }
      return mail;
    }).call();
  }
}

module.exports = Gmailler;