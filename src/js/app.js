/**
 * Global
 */
const DIR = __dirname;
const LIBS_DIR = `${DIR}/../js/libs`;
const CONF_DIR = `${DIR}/../../config`;

const EventEmitter = require('events');

class AppEmitter extends EventEmitter { }
const appEmitter = new AppEmitter();


/**
 * Npm
 */
const _ = require('lodash');
const moment = require('moment');
const ReState = require(`${LIBS_DIR}/re.state`);
const Storage = require(`${LIBS_DIR}/storage`);
const Gmailler = require(`${LIBS_DIR}/gmailler`);
const Common = require(`${LIBS_DIR}/common`);
const Curl = require(`${LIBS_DIR}/curl`);
const Helper = require(`${LIBS_DIR}/helper`);
const View = require(`${LIBS_DIR}/view`);
const LocalDb = require(`${LIBS_DIR}/localDb`);
const Communicator = require(`${LIBS_DIR}/communicator`);
const Logger = require(`${LIBS_DIR}/logger`);
const Notice = require(`${LIBS_DIR}/notice`);

const communicator = new Communicator();
const state = new ReState(communicator);
const logger = new Logger();
const storage = new Storage();
const db = new LocalDb('mailer');
const gmailler = new Gmailler(communicator);

/**
 * front
 */
const $$ = (e) => {
  return document.querySelector(e);
};


/**
 * config
 */
const dbSchemas = [];
require('fs').readdir(`${CONF_DIR}/db`, (e, files) => {
  files.forEach((file) => {
    const version = file.split('.')[1];
    dbSchemas.push(require(`${CONF_DIR}/db/${file}`));
  });
  db.init(dbSchemas);
});