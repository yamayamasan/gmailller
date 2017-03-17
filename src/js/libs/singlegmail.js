const Gmail = require(`${LIBS_DIR}/gmail`);

class SingleGmail {

  constructor() {
    this.instance = {};
  }

  getInstance(key) {
    if (this.instance[key]) return this.instance[key];

    this.instance[key] = new Gmail;
    return this.instance[key];
  }
}

module.exports = new SingleGmail;