const EventEmitter = require('events');

class AppEmitter extends EventEmitter {}
const appEmitter = new AppEmitter();

class State {
  constructor() {
    this.data = {};
  }

  get(key, def = null) {
    return this.data[key] || def;
  }

  set(key, val) {
    this.data[key] = val;
    appEmitter.emit('data-change', key);
  }

  sets(values) {
    _.forEach(values, (val, key) => {
      this.set(key, val);
    });
  }

  watcher(key, cb) {
    appEmitter.on('data-change', (a) => {
      if (a === key) cb(this.data[key]);
    });
  }
}

module.exports = State;