const qs = require('querystring');
const inbox = require('inbox');
const nodemailer = require('nodemailer');
const _ = require('lodash');
const crypto = require('crypto');

const Mail = require('./mail');

const config = {
  client: require(`../config/client_id.json`).installed,
  gmail: require(`../config/auth.json`).gmail,
};

class Gmail {

  /**
   * Creates an instance of Gmail.
   * 
   * @memberOf Gmail
   */
  constructor() {
    this.client = null;
    this.config = config;
    this.oauth = {};
  }

  /**
   * get authGmail url
   * 
   * @returns auth gmail
   * 
   * @memberOf Gmail
   */
  authGmail() {
    const opts = Gmail.getPackObject(this.config.gmail, ['scope', 'response_type', 'approval_prompt', 'access_type']);
    const conf = Object.assign({
      client_id: this.config.client.client_id,
      redirect_uri: this.config.client.redirect_uris[0],
    }, opts);
    const query = qs.stringify(conf);
    return `${config.client.auth_uri}?${query}`;
  }

  /**
   * set oauth configs
   * 
   * @param {object} user  
   * @param {object} oauth 
   * 
   * @memberOf Gmail
   */
  setOauthConfig(user, oauth) {
    const cOpts = Gmail.getPackObject(this.config.client, {
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

  /**
   * create connection to gmail
   * 
   * @returns 
   * 
   * @memberOf Gmail
   */
  createConnection() {
    return new Promise((resolve, reject) => {
      this.client = inbox.createConnection(false, 'imap.gmail.com', {
        secureConnection: true,
        auth: { XOAuth2: this.oauth },
        // debug: true,
      });
      this.client.connect();

      this.client.on('connect', () => {
        // logger.info('connected');
        resolve({ result: true });
      });

      this.client.on('close', () => {
        // logger.info('disconnected');
        reject({ result: false });
      });

      this.client.on('error', (err) => {
        // logger.error(err, this.oauth);
      });
    });
  }

  listMailWithChildren(mailbox) {
    return new Promise((resolve, reject) => {
      mailbox.listChildren((error, children) => {
        children.forEach((child) => {
          child.parent = mailbox.uuid;
        });
        resolve(children);
      });
    });
  }

  static asyncForEach(array, cb) {
    (async() => {
      for (let i = 0; i < array.length; i++) {
        const o = array[i];
        await cb(o);
      }
    });
  }

  /**
   * get list mailbox
   * 
   * @returns 
   * 
   * @memberOf Gmail
   */
  listMailboxes() {
    return new Promise((resolve, reject) => {
      this.client.listMailboxes(async(err, mailboxes) => {
        if (err) reject(err);
        let childList = [];
        for (let i = 0; i < mailboxes.length; i++) {
          const mailbox = mailboxes[i];
          mailbox.uuid = Gmail.getHash(mailbox.name);
          if (mailbox.hasChildren) {
            const children = await this.listMailWithChildren(mailbox);
            children.forEach((child) => {
              child.uuid = Gmail.getHash(child.name);
              childList.push(child);
            });
          }
        }
        resolve(mailboxes.concat(childList));
      });
    });
  }

  /**
   * open mailbox
   * 
   * @param {any} path 
   * @returns 
   * 
   * @memberOf Gmail
   */
  openMailBox(path) {
    return new Promise((resolve, reject) => {
      this.client.openMailbox(path, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  }

  /**
   * get list messages
   * 
   * @param {string} path 
   * @param {number} [f=-10] 
   * @param {number} [limit=10] 
   * @returns 
   * 
   * @memberOf Gmail
   */
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
    return (async function() {
      // let dbdata = await db.get('mails', { uid });
      // if (dbdata === null) {
      const fetchData = await this.fetchMessage(uid);
      return fetchData;
      // const dbdata = {
      //   uid: uid,
      //   subject: fetchData.subject,
      //   text: fetchData.text,
      //   html: fetchData.html,
      //   content: fetchData.html || fetchData.text,
      //   messageId: fetchData.messageId,
      //   from: fetchData.from,
      //   to: fetchData.to,
      //   date: fetchData.date,
      //   read: true,
      // };
      //   db.put('mails', dbdata);
      // }
      // return dbdata;
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
        resolve(body);
        // mail.bodyParse(body).then((content) => {
        // resolve(content);
        // });
      });
    });
  }

  countUnRead(path) {
    return new Promise(async(resolve) => {
      const searched = await this.search(path, { unseen: true });
      resolve(searched.length);
    });
  }

  addFlags(uid, flags) {
    return new Promise((resolve, reject) => {
      this.client.addFlags(uid, flags, (err, info) => {
        if (err) reject(err);
        resolve(info);
      });
    });
  }

  /**
   * flags Seen -> 既読
   * @param {*} from 
   * @param {*} limit 
   */
  listFlags(from, limit = 10) {
    return new Promise((resolve) => {
      this.client.openMailbox('INBOX', (error, info) => {
        this.client.listFlags(from, limit, (err, messages) => {
          resolve(messages);
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

  postMessage(from, message) {
    const auth = Object.assign({}, this.oauth);
    auth.type = 'OAuth2';
    return new Promise((resolve, reject) => {
      const smtp = nodemailer.createTransport({
        service: 'Gmail',
        auth,
        debug: true,
      }, from);

      smtp.sendMail(message, (err, info) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        console.log(info);
        smtp.close();
        resolve(info);
      });
    });
  }

  storeMessage(path, message) {
    return new Promise((resolve, reject) => {
      this.client.openMailbox(path, (err) => {
        if (err) reject(err);

        this.client.storeMessage(message, (err, params) => {
          console.log(err, params);
          resolve(params);
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

  close() {
    this.client.close();
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
      if (!r) r = flag.match(/Seen/).index > 0;
    });
    return r;
  }

  static getPackObject(obj, values) {
    const isObject = _.isPlainObject(values);
    const isArray = _.isArray(values);
    const res = {};
    _(values).forEach((val, key) => {
      if (isObject && !isArray) res[val] = obj[key];
      if (isArray && !isObject) res[val] = obj[val];
    });
    return res;
  }

  static getHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }
}

module.exports = Gmail;