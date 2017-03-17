const moment = require('moment');

class Helper {

  constructor(_this_) {
    this.context = _this_;
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
}

module.exports = Helper;