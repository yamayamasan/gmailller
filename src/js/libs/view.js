class View {

  constructor(params, _this_) {
    this.params = params;
    this.context = _this_;
  }

  init() {
    this.context.view = Object.assign({}, this.params);
    this.context.update();
  }

  get(key) {
    return this.context.view[key];
  }

  sets(values) {
    _.forEach(values, (val, key) => {
      this.context.view[key] = val;
    });
    this.context.update();
  }

  restore(key, isUpdate = false) {
    this.context.view[key] = this.params[key];
    if (isUpdate) this.context.update();
  }
}

module.exports = View;