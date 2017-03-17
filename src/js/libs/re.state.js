class ReState {
  constructor(communicator) {
    this.communicator = communicator;
  }

  initialize(values) {
    this.communicator.send('state:init', values);
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
    this.communicator.on('state:set:res', (event, arg) => {
      const okey = Object.keys(arg)[0];
      if (okey === key) cb(arg);
    });
  }
}

module.exports = ReState;