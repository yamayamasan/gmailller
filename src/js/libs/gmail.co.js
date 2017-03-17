const qs = require('querystring');
const inbox = require('inbox');
const co = require('co');

const Mail = require(`${LIBS_DIR}/mail`);

const config = {
  client: require(`${CONF_DIR}/client_id.json`).installed,
  gmail: require(`${CONF_DIR}/auth.json`).gmail,
};

class Gmail {

  constructor() {
    this.client = null;
    this.config = config;
  }

  authGmail() {
    const opts = Common.getPackObject(this.config.gmail, ['scope', 'response_type', 'approval_prompt', 'access_type']);
    const conf = Object.assign({
      client_id: this.config.client.client_id,
      redirect_uri: this.config.client.redirect_uris[0],
    }, opts);
    const query = qs.stringify(conf);
    return `${config.client.auth_uri}?${query}`;
  }

  createConnection(user, oauth) {
    const cOpts = Common.getPackObject(this.config.client, {
      client_id: 'clientId',
      client_secret: 'clientSecret',
    });
    const oauthInfo = Object.assign({}, {
      user,
      refreshToken: oauth.refresh_token,
      accessToken: oauth.access_token,
      timeout: oauth.expires_in,
    }, cOpts);
    return new Promise((resolve, reject) => {
      this.client = inbox.createConnection(false, 'imap.gmail.com', {
        secureConnection: true,
        auth: { XOAuth2: oauthInfo },
        // debug: true,
      });
      this.client.connect();

      this.client.on('connect', () => {
        resolve({ result: true });
      });

      this.client.on('close', () => {
        reject({ result: false });
      });

      this.client.on('error', (err) => {
        console.error(err, oauthInfo);
      });
    });
  }

  listMailboxes() {
    return new Promise((resolve, reject) => {
      this.client.listMailboxes((err, mailboxes) => {
        if (err) reject(err);
        resolve(mailboxes);
      });
    });
  }

  openMailBox(path) {
    return new Promise((resolve, reject) => {
      this.client.openMailbox(path, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  }

  listMessages(path, f = -10, limit = 10) {
    return new Promise((resolve, reject) => {
      this.client.openMailbox(path, (err0, info) => {
        if (err0) throw reject(err0);
        this.client.listMessages(f, limit, (err1, messages) => {
          if (err1) throw reject(err1);
          resolve(messages);
        });
      });
    });
  }

  getMessage(uid) {
    return co(function*() {
      const dbdata = yield db.get('mails', { uid });
      if (dbdata) {
        return dbdata;
      } else {
        const fetchData = yield this.fetchMessage(uid);
        const inputs = {
          "uid": uid,
          "subject": fetchData.subject,
          "text": fetchData.text,
          "html": fetchData.html,
          "content": fetchData.html || fetchData.text,
          "messageId": fetchData.messageId,
          "from": fetchData.from,
          "to": fetchData.to,
          "date": fetchData.date
        };
        db.put('mails', inputs);
        return inputs;
      }
    }.bind(this));
  }

  fetchMessage(uid) {
    return new Promise((resolve) => {
      const messageStream = this.client.createMessageStream(uid);
      let body = '';
      messageStream.on('data', (data) => {
        body += data;
      });

      messageStream.on('end', () => {
        const mail = new Mail();
        mail.bodyParse(body).then((content) => {
          resolve(content);
        });
      });
    });
  }

  // dep
  fetchData(uid) {
    return new Promise((resolve, reject) => {
      this.client.fetchData(uid, (err, message) => {
        if (err) reject(err);
        resolve(message);
      });
    });
  }

  // progress
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

  watcher(cb, path = 'INBOX') {
    this.client.openMailbox(path, (error, info) => {
      if (error) throw error;
      this.client.on("new", (message) => {
        cb(message);
      });
    });
  }
}

module.exports = Gmail;