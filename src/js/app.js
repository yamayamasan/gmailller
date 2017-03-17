/**
 * Global
 */
const DIR = __dirname;
const LIBS_DIR = `${DIR}/js/libs`;
const CONF_DIR = `${DIR}/../config`;

/**
 * config
 */
const dbSchema = require(`${CONF_DIR}/db.schemas.json`);

/**
 * Npm
 */
const _ = require('lodash');
const moment = require('moment');
const State = require(`${LIBS_DIR}/state`);
const ReState = require(`${LIBS_DIR}/re.state`);
const Storage = require(`${LIBS_DIR}/storage`);
const Gmail = require(`${LIBS_DIR}/singlegmail`);
const Common = require(`${LIBS_DIR}/common`);
const Curl = require(`${LIBS_DIR}/curl`);
const Helper = require(`${LIBS_DIR}/helper`);
const View = require(`${LIBS_DIR}/view`);
const LocalDb = require(`${LIBS_DIR}/localDb`);
const Communicator = require(`${LIBS_DIR}/communicator`);
const Logger = require(`${LIBS_DIR}/logger`);

const communicator = new Communicator();
const state = new ReState(communicator);
const logger = new Logger();
const storage = new Storage();
const db = new LocalDb('mailer');

/**
 * front
 */
const $$ = (e) => {
  return document.querySelector(e);
};

db.init(dbSchema.schema);