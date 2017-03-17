class Common {

  static getPackObject(obj, values) {
    const isObject = _.isPlainObject(values);
    const isArray = _.isArray(values);
    const res = {};
    _(values).forEach((val, key) => {
      if (isObject && !isArray) res[val] = obj[key];
      if (isArray && !isObject) res[val] = obj[val];
    });
    return res;
  }
}

module.exports = Common;