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
        let content = null;
        console.log(mail.html)
        if (mail.html) {
          content = this.convertText(mail.html);
        } else {
          content = this.convertText(mail.text);
          console.log(content)
          content = content.replace(/\r\n|\r|\n/g, '<br />');
        }
        mail.content = content;
        resolve(mail);
      });
    });
  }

  convertText(text) {
    let trans = text;
    const object = Object.assign({}, this.object);
    this.object = {};
    if (object.charset === 'iso-2022-jp') {
      trans = jconv.convert(text, 'ISO-2022-JP', 'UTF-8').toString();
    }
    return trans;
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