const util = require('util');

class Logger {

  constructor() {
    this.config = {};
  }

  log(...args) {
    const trace = new Error().stack.split('\n');
    const base = this.parse(trace);
    const msg = this.objectParse(args);
    console.log(`[Log][${base.file}:${base.line}]`, msg, `(${base.file_fullpath})`);
  }

  info(...args) {
    const trace = new Error().stack.split('\n');
    const base = this.parse(trace);
    const msg = this.objectParse(args);
    console.info(`[Info][${base.file}:${base.line}]`, msg, `(${base.file_fullpath})`);
  }

  error(...args) {
    const trace = new Error().stack.split('\n');
    const base = this.parse(trace);
    const msg = this.objectParse(args);
    console.error(`[Error][${base.file}:${base.line}]`, msg, `(${base.file_fullpath})`);
  }

  parse(data) {
    const caller = data[2].match(/\((.*)\)/)[1]; // 多分trace[2]
    const tmp = caller.split(':');
    return {
      file_fullpath: tmp[0],
      file: tmp[0].split('/').pop(),
      line: tmp[1],
    };
  }

  objectParse(args) {
    return args.map((arg) => {
      return util.inspect(arg);
    }).join(' ');
  }
}

module.exports = Logger;