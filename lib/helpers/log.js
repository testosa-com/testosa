const chalk = require('chalk');
const _ = require('lodash');
const {
  LOG_COLOR_GREEN_SOFT,
  LOG_COLOR_RED_SOFT,
  LOG_COLOR_YELLOW_SOFT
} = require('../constants/log-colors');
const log = require('../utils/log');

const logEmptyLines = (count = 1) => {
  for (let i = 0; i < count; i++) {
    log.info('');
  }
};

const logErrorAndTerminate = (message, heading) => {
  const title = heading || 'Test execution error';
  log.error(chalk.bold(`${title}:`));

  if (message) {
    log.error(message);
  }

  logEmptyLines();

  process.exit(1);
};

const logSectionDelimiter = (char = '-', length = 75) => {
  let message = '';

  for (let i = 0; i < length; i++) {
    message = `${message}${char}`;
  }

  log.info(message);
};

const logFailedResponseBodyAssertion = (errors, data) => {
  log.info('       [Response body]');

  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];
    const { instancePath = '', keyword, params } = error;

    const regexReplaceFirstSlash = new RegExp('/');
    const regexReplaceRemainingSlashes = new RegExp('/', 'g');

    /* eslint-disable indent */
    const trimmedDataPath =
      instancePath === ''
        ? instancePath
        : instancePath
            .replace(regexReplaceFirstSlash, '')
            .replace(regexReplaceRemainingSlashes, '.');
    /* eslint-enable indent */

    switch (keyword) {
      case 'required':
        const { missingProperty } = params;
        log.info('data property', '       Expected');
        log.error(
          `missing required property '${missingProperty}'`,
          '       Received'
        );
        break;

      case 'type':
        const expectedFormat = params.type.split(',').join(' OR ');

        if (!instancePath) {
          log.info(
            `response object to be of type "${expectedFormat}`,
            '       Expected'
          );
        } else {
          log.info(
            `${trimmedDataPath} to be of type ${expectedFormat}`,
            '       Expected'
          );
        }

        const receivedValue = _.get(data, trimmedDataPath);
        log.error(JSON.stringify(receivedValue), '       Received');
        break;

      default:
        break;
    }
  }

  logEmptyLines();
};

const logFailedResponseStatusCodeAssertion = (error) => {
  log.info('       [Status code]');
  log.info(error.expected, '       Expected');
  log.error(error.actual, '       Received');
};

const logTestSuiteName = (method, summary, endpoint) => {
  const formattedSummary = summary ? ` > ${summary}` : '';
  log.info(`\n\n${method.toUpperCase()}${formattedSummary} > ${endpoint}`);
};

const logTestName = (status, testMetaData) => {
  const { duration, resolvedPath, statusCode } = testMetaData;
  const formattedDuration = duration
    ? chalk.hex(LOG_COLOR_RED_SOFT)(`(${duration})`)
    : chalk.hex(LOG_COLOR_RED_SOFT)('---');
  const formattedStatus = _.startCase(statusCode);
  let message = `${formattedStatus}   ${resolvedPath} ${formattedDuration}`;

  const symbols = {
    fail: chalk.hex(LOG_COLOR_RED_SOFT)('✖'),
    pass: chalk.hex(LOG_COLOR_GREEN_SOFT).bold('✔'),
    skip: chalk.hex(LOG_COLOR_YELLOW_SOFT).bold('◻')
  };

  message = `    ${symbols[status.toLowerCase()]}  ${message}`;

  log.info(message);
};

const logTestsResults = (testResults) => {
  logEmptyLines(3);
  logSectionDelimiter();

  const { duration, failedCount, passedCount, skippedCount, totalCount } =
    testResults;
  const results = [];

  if (skippedCount) {
    results.push(chalk.hex(LOG_COLOR_YELLOW_SOFT)(`${skippedCount} skipped`));
  }

  results.push(chalk.hex(LOG_COLOR_GREEN_SOFT)(`${passedCount} passed`));

  if (failedCount) {
    results.push(chalk.hex(LOG_COLOR_RED_SOFT)(`${failedCount} failed`));
  }

  results.push(`${totalCount} total`);

  const overallResult = failedCount ? 'FAIL' : 'PASS';

  log.info(overallResult, 'Result');
  log.info(` ${results.join(', ')}`, 'Tests');
  log.info(`  ${duration} s`, 'Time');
  logSectionDelimiter();
};

module.exports = {
  logEmptyLines,
  logErrorAndTerminate,
  logFailedResponseBodyAssertion,
  logFailedResponseStatusCodeAssertion,
  logSectionDelimiter,
  logTestName,
  logTestsResults,
  logTestSuiteName
};
