class Logger {

  constructor() {
    this.config = {};
  }

  log(...args) {
    const trace = new Error().stack.split('\n');
    const base = this.parse(trace);
    // object or array時の表現
    const msg = args.join(' ');
    console.log(`[Log][${base.file}:${base.line}]`, msg, `(${base.file_fullpath})`);
  }

  info(...args) {
    const trace = new Error().stack.split('\n');
    const base = this.parse(trace);
    // object or array時の表現
    const msg = args.join(' ');
    console.info(`[Info][${base.file}:${base.line}]`, msg, `(${base.file_fullpath})`);
  }

  error(...args) {
    const trace = new Error().stack.split('\n');
    const base = this.parse(trace);
    // object or array時の表現
    const msg = args.join(' ');
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
}

module.exports = Logger;