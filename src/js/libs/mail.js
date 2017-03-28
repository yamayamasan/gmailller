const simpleParser = require('mailparser').simpleParser;
const jconv = require('jconv');
const jschardet = require('jschardet');

class Mail {

  constructor() {
    this.body = null;
    this.object = {};
  }

  set(body) {
    this.body = body;
  }

  bodyParse(body = null) {
    if (body) this.body = body;
    return new Promise((resolve, reject) => {
      simpleParser(this.body, (err, mail) => {
        if (err) reject(err);
        const content = (function(mail) {
          if (mail.html) {
            return Mail.convertText(mail.html);
          }
          const tmp = Mail.convertText(mail.text);
          return tmp.replace(/\r\n|\r|\n/g, '<br />');
        }.bind(this, mail)).call();

        const copy = _.cloneDeep(mail);
        copy.content = content;
        copy.subject = Mail.convertText(mail.subject);
        resolve(copy);
      });
    });
  }

  static convertText(text) {
    let trans = text;
    const detect = jschardet.detect(text);

    if (Mail.isEncoding(detect.encoding) && detect.confidence > 0.5) {
      trans = jconv.convert(text, detect.encoding, 'UTF-8').toString();
    }
    return trans;
  }

  static isEncoding(encoding) {
    if (encoding == 'utf-8' || encoding == 'ascii') {
      return false;
    }
    return true;
  }

  getCharset() {
    const reg = this.body.match(/charset=.*/);
    const split = reg[0].split('=');
    const charset = split[1].replace(/"/g, '');
    this.object.charset = charset.toLowerCase();
  }

  getContentTypeEncoding() {
    const reg = this.body.match(/Content-Transfer-Encoding.*/);
    const split = reg[0].split(':');
    const encoding = split[1].replace(/"/g, '').trim();
    this.object.encoding = encoding.toLowerCase();
  }
}

module.exports = Mail;