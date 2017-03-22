class Gmailler {

  constructor(communicator) {
    this.comm = communicator;
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

  sendSync(action, key, params) {
    return this.comm.sendSync(`gmail:${action}.sync`, {
      key,
      params,
    });
  }
}

module.exports = Gmailler;