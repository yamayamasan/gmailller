const moment = require('moment');

const inputValues = {};

class Helper {

  constructor(_this_) {
    this.context = _this_;
    this.inputValues = {};
  }

  logout() {
    storage.remove('gmail');
    console.log()
    this.context.unmount();
    riot.mount('start');
  }

  date(org, fmt = 'YYYY/MM/DD HH:mm') {
    return moment(org).format(fmt);
  }

  input(e) {
    inputValues[e.target.name] = e.target.value;
  }

  getValue(key) {
    if (key) {
      return inputValues[key] || null;
    }
    return inputValues;
  }
}

module.exports = Helper;