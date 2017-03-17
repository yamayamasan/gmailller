const Dexie = require('dexie');

class LocalDb {

  constructor(dbname) {
    this.db = new Dexie(dbname);
    this.table = null;
  }

  init(schemas) {
    const schema = this.parseSchema(schemas);
    this.db.version(schema.version).stores(schema.columns);
  }

  add(tblname, params) {
    return this.db[tblname].add(params);
  }

  all(tblname) {
    return this.db[tblname].toArray();
  }

  table(tblname) {
    return this.db[tblname];
  }

  parseSchema(schemas) {
    const response = {
      version: schemas.version,
      tables: {},
    };
    schemas.tables.forEach((schema) => {
      const table = schema.table;
      const columns = [];
      _.forEach(schema.columns, (opt, col) => {
        let key = col;
        if (opt !== null) key = `${opt}${col}`;
        columns.push(key);
      });
      response.tables[table] = columns.join(',');
    });
    return response;
  }
}

module.exports = LocalDb;