const path = require('path');
const callsite = require('callsite');
const chalk = require('chalk');
const { createLogger, format, transports } = require('winston');
const {
  getObjectByPath,
  isArray,
  isInteger,
  isPlainObject,
  isString
} = require('./data-types');

const levels = {
  debug: 4,
  error: 0,
  info: 2,
  success: 3,
  warn: 1
};

const log = createLogger({
  level: 'success',
  levels,
  transports: [
    new transports.Console({
      format: format.combine(format.printf((info) => `${info.message}`)),
      humanReadableUnhandledException: true,
      prettyPrint: true,
      stringify: true
    })
  ]
});

const handleLog = (level, message, prefix, hideLevel, context) => {
  const color = {
    debug: 'cyan',
    error: 'red',
    info: 'white',
    success: 'green',
    warn: 'yellow'
  };

  let fullMessage = '';

  if (prefix) {
    fullMessage = `${prefix}: `;
  }

  fullMessage = `${fullMessage}${chalk[color[level]](message)}`;

  if (context) {
    fullMessage = `${fullMessage}${chalk.gray(` > ${context}`)}`;
  }

  log[level](fullMessage);
};

// istanbul ignore next
const getLogContext = (site) => {
  const excludeSysFilepath = path.join(__dirname, '../../');
  let fileName = isString(site.getFileName()) ? site.getFileName() : '';
  fileName = fileName.replace(excludeSysFilepath, '');

  let functionName = 'anonymous';

  if (isString(site.getFunctionName())) {
    functionName = `${site
      .getFunctionName()
      .replace(/.then/g, '')
      .replace(/.catch/g, '')}`;
  }

  return `${fileName}#${functionName}, ln ${site.getLineNumber()}`;
};

// istanbul ignore next
exports.logMessage = (level, msg, prefix, delta, showContext) => {
  const siteDelta = isInteger(delta) ? 2 + delta : 2;
  const site = getObjectByPath(callsite(), [siteDelta]);
  const context = getLogContext(site);
  let enhancedMsg = msg;

  if (msg instanceof Error) {
    enhancedMsg = msg.toString();
  } else if (isPlainObject(msg) || isArray(msg)) {
    enhancedMsg = JSON.stringify(msg);
  }

  handleLog(level, enhancedMsg, prefix, showContext === false ? null : context);
};

// eslint-disable-next-line max-len
exports.debug = (msg, siteDelta, showContext) =>
  exports.logMessage('debug', msg, siteDelta, showContext);
// eslint-disable-next-line max-len
exports.info = (msg, prefix, siteDelta, showContext) =>
  exports.logMessage('info', msg, prefix, siteDelta, showContext);
// eslint-disable-next-line max-len
exports.warn = (msg, siteDelta, showContext) =>
  exports.logMessage('warn', msg, siteDelta, showContext);
// eslint-disable-next-line max-len
exports.success = (msg, prefix, siteDelta, showContext) =>
  exports.logMessage('success', msg, prefix, siteDelta, showContext);
// eslint-disable-next-line max-len
exports.error = (msg, prefix, siteDelta, showContext) =>
  exports.logMessage('error', msg, prefix, siteDelta, showContext);
