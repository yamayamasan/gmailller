const _ = require('lodash');

class State {

  constructor(ipcMain) {
    this.ipc = ipcMain;
    this.data = {};
    this.old = {};
    this.actions();
  }

  set(key, val) {
    this.old[key] = _.cloneDeep(this.data)[key];
    _.set(this.data, key, val);
  }

  get(key) {
    return _.get(this.data, key);
  }

  has(key) {
    return _.has(this.data, key);
  }

  actions() {
    this.ipc.on('state:init', (ev, arg) => {
      _.forEach(arg, (val, key) => {
        this.set(key, val);
      });
    });

    this.ipc.on('state:set', (ev, arg) => {
      const key = Object.keys(arg)[0];
      this.set(key, arg[key]);

      ev.sender.send('state:set:res', arg, this.old);
    });

    this.ipc.on('state:get', (ev, arg) => {
      const key = arg.key;
      const def = arg.def;
      const data = this.has(key) ? this.get(key) : def;

      ev.returnValue = data;
    });
  }
}

module.exports = State;