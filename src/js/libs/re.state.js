class ReState {
  constructor(communicator) {
    this.communicator = communicator;
    this.local = {
      data: {},
      has: this.hasLocal,
      get: this.getLocal,
      set: this.setLocal,
      remove: this.removeLocal,
    };
  }

  initialize(values) {
    this.communicator.send('state:init', values);
  }

  hasLocal(key) {
    return _.has(this.data, key);
  }

  getLocal(key) {
    return _.get(this.data, key);
  }

  setLocal(key, val) {
    _.set(this.data, key, val);
  }

  removeLocal(key) {
    const d = _.omit(this.data, key);
    this.data = d;
  }

  get(key, def = null) {
    const data = this.communicator.sendSync('state:get', {
      key,
      def,
    });
    return data;
  }

  set(key, val) {
    this.communicator.send('state:set', {
      [key]: val,
    });
  }

  sets(values) {
    _.forEach(values, (val, key) => {
      this.set(key, val);
    });
  }

  observe(key, cb) {
    this.communicator.on('state:set:res', (event, arg, old) => {
      const okey = Object.keys(arg)[0];
      if (okey === key) cb(arg[key], old[key]);
    });
  }
}

module.exports = ReState;