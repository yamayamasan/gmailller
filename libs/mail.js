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
        const content = (function(mail) {
          if (mail.html) {
            return this.convertText(mail.html);
          }
          const tmp = this.convertText(mail.text);
          return tmp.replace(/\r\n|\r|\n/g, '<br />');
        }.bind(this, mail)).call();

        // let content = null;
        // if (mail.html) {
        //   content = this.convertText(mail.html);
        // } else {
        //   const tmp = this.convertText(mail.text);
        //   content = tmp.replace(/\r\n|\r|\n/g, '<br />');
        // }
        // mail.content = this.convertText(content);
        // mail.subject = this.convertText(mail.subject);
        const copy = _.cloneDeep(mail);
        copy.content = this.convertText(content);
        copy.subject = this.convertText(mail.subject);
        console.log(copy);
        this.object = {};
        resolve(copy);
      });
    });
  }

  convertText(text) {
    let trans = text;
    const object = Object.assign({}, this.object);
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