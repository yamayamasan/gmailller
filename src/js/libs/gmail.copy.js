const qs = require('querystring');
const inbox = require('inbox');
const co = require('co');

const config = require(`${__dirname}/../../../config/client_id.json`).installed;

class Gmail {

  constructor() {
    this.client = null;
    this.config = config;
  }

  static authGmail() {
    const query = qs.stringify({
      client_id: config.client_id,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      scope: 'https://mail.google.com/',
      response_type: 'code',
      approval_prompt: 'force',
      access_type: 'offline',
    });
    const url = `${config.auth_uri}?${query}`;
    return url;
  }

  createConnection(oauth) {
    const oauthInfo = Object.assign({}, oauth, {
      clientId: config.client_id,
      clientSecret: config.client_secret,
    });
    return new Promise((resolve, reject) => {
      this.client = inbox.createConnection(false, 'imap.gmail.com', {
        secureConnection: true,
        auth: { XOAuth2: oauthInfo },
        // debug: true,
      });
      this.client.connect();

      this.client.on('connect', () => {
        console.log('connected');
        resolve({ result: true });
      });

      this.client.on('close', () => {
        console.log('disconnected');
        reject({ result: false });
      });
    });
  }

  graphMailboxes() {
    return co(function*() {
      const listMailboxes = yield this.listMailboxes();

      listMailboxes.forEach((listMailbox) => {
        listMailbox.open((err, info) => {
          listMailbox.info = info;
        });
      });
      return listMailboxes;
    }.bind(this));
  }

  listMailboxes() {
    return new Promise((resolve) => {
      this.client.listMailboxes((error, mailboxes) => {
        resolve(mailboxes);
      });
    });
  }

  hierarchyMaixboxes(listMailboxes) {
    listMailboxes.forEach((listMailbox, k) => {
      if (k < 2) {
        this.openMailBox(listMailbox.path).then(() => {
          console.log('s')
        });
      }
      if (listMailbox && listMailbox.hasChildren) {
        listMailbox.listChildren((e, children) => {
          listMailbox.children = children;
        });
      }
    });
    return listMailboxes;
  }

  // depricate
  getMailBox(path = null) {
    return new Promise((resolve) => {
      this.client.getMailbox(path, (error, mailbox) => {
        if (mailbox && mailbox.hasChildren) {
          mailbox.listChildren(console.log);
        }
      });
    });
  }

  openMailBox(path) {
    return new Promise((resolve) => {
      this.client.openMailbox(path, (error, info) => {
        console.log(info);
        resolve(info);
      });
    });
  }

  listMessages(path, f = -10, limit = 10) {
    return new Promise((resolve) => {
      this.client.openMailbox(path, (error, info) => {
        if (error) throw error;
        this.client.listMessages(f, limit, (err, messages) => {
          resolve(messages);
        });
      });
    });
  }

  search(path, query = {}) {
    return new Promise((resolve) => {
      this.client.openMailbox(path, (error, info) => {
        if (error) throw error;
        this.client.search(query, (err, messages) => {
          resolve(messages);
        });
      });
    });
  }

  watcher(cb) {
    this.client.openMailbox('INBOX', (error, info) => {
      if (error) throw error;
      this.client.on("new", (message) => {
        cb(message);
      });
    });
  }

  getConfig() {
    return this.config;
  }
}

module.exports = Gmail;