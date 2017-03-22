const Loki = require('lokijs');

class LokiDb {

  constructor(file, collections) {
    this.loki = new Loki(file);
    this.db = {};

    collections.forEach((col) => {
      this.db[col] = this.loki.addCollection(col);
      this[col] = this.db[col];
    });
  }

}

module.exports = LokiDb;