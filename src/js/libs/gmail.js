const qs = require('querystring');
const inbox = require('inbox');

const Mail = require(`${LIBS_DIR}/mail`);

const config = {
  client: require(`${CONF_DIR}/client_id.json`).installed,
  gmail: require(`${CONF_DIR}/auth.json`).gmail,
};

class Gmail {

  constructor() {
    this.client = null;
    this.config = config;
    this.oauth = {};
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

  setOauthConfig(user, oauth) {
    const cOpts = Common.getPackObject(this.config.client, {
      client_id: 'clientId',
      client_secret: 'clientSecret',
    });
    this.oauth = Object.assign({}, {
      user,
      refreshToken: oauth.refresh_token,
      accessToken: oauth.access_token,
      timeout: oauth.expires_in,
    }, cOpts);
  }

  createConnection() {
    return new Promise((resolve, reject) => {
      this.client = inbox.createConnection(false, 'imap.gmail.com', {
        secureConnection: true,
        auth: { XOAuth2: this.oauth },
        // debug: true,
      });
      this.client.connect();

      this.client.on('connect', () => {
        logger.info('connected');
        resolve({ result: true });
      });

      this.client.on('close', () => {
        logger.info('disconnected');
        reject({ result: false });
      });

      this.client.on('error', (err) => {
        logger.error(err, this.oauth);
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
          const msgs = messages.map((message) => {
            message.read = Gmail.isRead(message);
            return message;
          });
          resolve(msgs);
        });
      });
    });
  }

  getMessage(uid) {
    return (async function () {
      let dbdata = await db.get('mails', { uid });
      if (dbdata === null) {
        const fetchData = await this.fetchMessage(uid);
        dbdata = {
          uid: uid,
          subject: fetchData.subject,
          text: fetchData.text,
          html: fetchData.html,
          content: fetchData.html || fetchData.text,
          messageId: fetchData.messageId,
          from: fetchData.from,
          to: fetchData.to,
          date: fetchData.date,
          read: true,
        };
        db.put('mails', dbdata);
      }
      return dbdata;
    }.bind(this)).call();
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

  countUnRead(path) {
    return new Promise(async (resolve) => {
      const searched = await this.search(path, { unseen: true });
      resolve(searched.length);
    });
  }
  // addFlags() {
  //   return new Promise((resolve) => {

  //   });
  // }
  /**
   * flags Seen -> 既読
   * @param {*} from 
   * @param {*} limit 
   */
  listFlags(from, limit = 10) {
    return new Promise((resolve) => {
      this.client.openMailbox('INBOX', (error, info) => {
        this.client.listFlags(from, limit, (err, messages) => {
          messages.forEach((message) => {
            console.log(message.UID, message);
            resolve(message);
          });
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

  observe(cb, path = 'INBOX') {
    this.client.openMailbox(path, (error, info) => {
      if (error) throw error;
      this.client.on('new', (message) => {
        cb(message);
      });
    });
  }

  disconnected(cb) {
    this.client.on('close', () => {
      cb();
    });
  }

  static isRead(msg) {
    if (msg.flags.length === 0) return false;

    let r = false;
    msg.flags.forEach((flag) => {
      if (!r) {
        r = flag.match(/Seen/).index > 0;
      }
    });
    return r;
  }
}

module.exports = Gmail;