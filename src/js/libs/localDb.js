const Dexie = require('dexie');

class LocalDb {

  constructor(dbname) {
    console.log('[DB Name]:', dbname);
    this.db = new Dexie(dbname);
    this.table = null;
  }

  init(schemas) {
    const schema = this.parseSchema(schemas);
    console.log('[DB schema]:', schema);
    this.db.version(schema.version).stores(schema.tables);
    this.db.open();
    console.log(this.db.tables);
  }

  d(tblname) {
    return this.db[tblname];
  }

  get(tblname, conditions) {
    return new Promise((resolve) => {
      const key = Object.keys(conditions)[0];
      this.db[tblname].where(key).equals(conditions[key]).first((data) => {
        resolve(data || null);
      });
    });
  }

  add(tblname, params) {
    return this.db[tblname].add(params);
  }

  put(tblname, params) {
    return this.db[tblname].put(params);
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