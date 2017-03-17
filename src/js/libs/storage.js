class Storage {
  constructor() {}

  get(key) {
    const values = localStorage.getItem(key);
    if (values && values.match(/\{.*\}|\[.*\]/)) {
      try {
        return JSON.parse(values);
      } catch (e) {}
    }
    return values;
  }

  save(key, val) {
    if (typeof val === 'object') val = JSON.stringify(val);
    localStorage.setItem(key, val);
  }

  remove(key) {
    localStorage.removeItem(key);
  }

  clear() {
    localStorage.clear();
  }

  keys() {
    return Object.keys(localStorage);
  }

  has(key) {
    if (_.isUndefined(localStorage[key])) return false;
    return true;
  }
}

module.exports = Storage;