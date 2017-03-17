const simpleParser = require('mailparser').simpleParser;
const jconv = require('jconv');

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
    this.getCharset();
    this.getContentTypeEncoding();
    return new Promise((resolve, reject) => {
      simpleParser(this.body, (err, mail) => {
        if (err) reject(err);
        // console.log(mail);
        mail.html = this.convertHTML(mail.html);
        // console.log(mail);
        resolve(mail);
      });
    });
  }

  convertHTML(text) {
    let trans = null;
    const object = Object.assign({}, this.object);
    this.object = {};
    if (object.charset === 'iso-2022-jp' &&
      object.encoding === 'quoted-printable') {
      trans = jconv.convert(text, 'ISO-2022-JP', 'UTF-8').toString();
    } else {
      trans = text;
    }
    return trans;
  }

  getCharset() {
    const reg = this.body.match(/charset\=.*/);
    const split = reg[0].split('=');
    const charset = split[1].replace(/\"/g, '');
    this.object.charset = charset.toLowerCase();
  }

  getContentTypeEncoding() {
    const reg = this.body.match(/Content-Transfer-Encoding.*/);
    const split = reg[0].split(':');
    const encoding = split[1].replace(/\"/g, '').trim();
    this.object.encoding = encoding.toLowerCase();
  }
}

module.exports = Mail;