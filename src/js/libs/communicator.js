class Communicator {

  constructor() {
    const {
      ipcRenderer
    } = require('electron');
    this.comt = ipcRenderer;
  }

  sendSync(label, object) {
    return this.comt.sendSync(label, object);
  }

  send(label, object) {
    this.comt.send(label, object);
  }

  on(eventName, cb, isOnce = false) {
    if (!isOnce) {
      this.comt.on(eventName, cb);
    } else {
      this.comt.once(eventName, cb);
    }
  }

  once(eventName, cb) {
    this.comt.on(eventName, cb);
  }
}

module.exports = Communicator;