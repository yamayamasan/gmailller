const Mail = require(`${LIBS_DIR}/mail`);
const mailLib = new Mail();

class Gmailler {

  constructor(communicator) {
    this.comm = communicator;
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
      const onAction = `on${action.replace(/^./, s => s.toUpperCase())}`;
      this[action] = (key, params, cb = null) => {
        this.send(action, key, params);
        if (cb !== null) this[onAction].call(this, cb);
      };
      this[onAction] = (cb) => {
        this.on(action, cb);
      };
      this[syncAction] = (key, params) => {
        return this.sendSync(action, key, params);
      };
    });
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

  getUnreadMailbox(key, params) {
    return (async() => {

    });
  }
}

module.exports = Gmailler;