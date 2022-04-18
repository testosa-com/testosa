const chalk = require('chalk');
const CliTable = require('cli-table');
const _ = require('lodash');
const stripAnsi = require('strip-ansi');
const { LOG_COLOR_WHITE } = require('../constants/log-colors');
const {
  TEST_STATUS_FAIL,
  TEST_STATUS_PASS,
  TEST_STATUS_SKIP
} = require('../constants/test-statues');
const log = require('../utils/log');

const symbols = {
  [TEST_STATUS_FAIL]: chalk.red('✖'),
  [TEST_STATUS_PASS]: chalk.green.bold('✔'),
  [TEST_STATUS_SKIP]: chalk.yellow.bold('◯')
};

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

  log.info(chalk.dim(message));
};

const logFailedResponsePropertiesAssertion = (errors, data, location) => {
  const errorHeading = chalk.dim(`[Response ${location}]`);
  const delimiter = chalk.dim('    │ ');
  log.info(`${delimiter}${errorHeading}`);
  let trimmedDataPath;

  for (let i = 0; i < errors.length; i++) {
    const error = errors[i];
    const {
      keyword,
      instancePath = '',
      message,
      params: { allowedValues = [], missingProperty = '' } = {}
    } = error;
    let updatedMessage = message;
    let propertyPath = instancePath;

    const regexReplaceFirstSlash = /\//;
    const regexReplaceRemainingSlashes = /\//g;

    switch (keyword) {
      case 'enum':
        updatedMessage = `must be equal to one of the allowed values: ${allowedValues.join(
          ', '
        )}`;
        break;

      case 'required':
        propertyPath = missingProperty;
        updatedMessage = 'missing required property';
        break;

      default:
        break;
    }

    /* eslint-disable indent */
    trimmedDataPath = propertyPath
      .replace(regexReplaceFirstSlash, '')
      .replace(regexReplaceRemainingSlashes, '.');
    /* eslint-enable indent */

    log.info(`${delimiter}${trimmedDataPath}: ${chalk.red(updatedMessage)}`);
  }
};

const logFailedResponseStatusCodeAssertion = (error) => {
  const delimiter = chalk.dim('    │ ');

  const errorHeading = chalk.dim('[Status code]');
  log.info(`${delimiter}${errorHeading}`);

  const expectedMessage = `${chalk.green(`Expected: ${error.expected}`)}`;
  log.info(`${delimiter}${expectedMessage}`);

  const receivedMessage = `${chalk.red(`Received: ${error.actual}`)}`;
  log.info(`${delimiter}${receivedMessage}`);
};

const logTestSuiteName = (method, summary, endpoint) => {
  const formattedMethod = method.toUpperCase();
  const formattedSummary = summary ? ` > ${summary}` : '';
  const formattedEndpoint = chalk.hex(LOG_COLOR_WHITE).bold(endpoint);
  const messagePrefix = `${formattedMethod}${formattedSummary} > `;

  logEmptyLines(2);
  log.info(`${messagePrefix}${formattedEndpoint}`);
};

const logTestName = (status, testMetaData) => {
  const { duration, resolvedPath, statusCode } = testMetaData;
  const formattedStatusCode = _.startCase(statusCode);
  const formattedDuration = ` (${duration || '---'})`;
  let formattedMessage = `${formattedStatusCode} ${resolvedPath}${formattedDuration}`;
  formattedMessage =
    status === TEST_STATUS_FAIL
      ? chalk.red(formattedMessage)
      : chalk.hex(LOG_COLOR_WHITE).dim(formattedMessage);

  log.info(`  ${symbols[status]} ${formattedMessage}`);
};

const logTestsResults = (testResults) => {
  logEmptyLines(3);
  const specsResultsTableColAligns = [
    null,
    null,
    'right',
    'right',
    'right',
    'right',
    'right'
  ];
  const tableCharsDefaults = {
    bottom: '─',
    'bottom-left': '└',
    'bottom-mid': '',
    'bottom-right': '┘',
    left: '│',
    'left-mid': '├',
    'mid-mid': '',
    middle: '',
    right: '│',
    'right-mid': '┤',
    top: '─',
    'top-left': '┌',
    'top-mid': '',
    'top-right': '┐'
  };

  const specsResultsTableHead = [
    '',
    'Spec',
    '',
    'Tests',
    'Passed',
    'Failed',
    'Skipped'
  ];
  const specsResultsTable = new CliTable({
    chars: tableCharsDefaults,
    colAligns: specsResultsTableColAligns
  });

  let totalFailedCount = 0;
  let totalPassedCount = 0;
  let totalSkippedCount = 0;
  const emptyCell = chalk.dim('-');

  const { specs, totalDuration, totalCount } = testResults;
  _.forEach(specs, (spec, endpoint) => {
    const { duration, failedCount, passedCount, skippedCount } = spec;
    const specCount = failedCount + passedCount + skippedCount;
    totalFailedCount += failedCount;
    totalPassedCount += passedCount;
    totalSkippedCount += skippedCount;

    const row = [
      '',
      endpoint,
      duration,
      specCount,
      passedCount,
      failedCount,
      skippedCount
    ].map((item, index) => {
      const isZero = item === 0;

      switch (index) {
        case 0:
          return failedCount
            ? chalk.red(symbols[TEST_STATUS_FAIL])
            : chalk.green(symbols[TEST_STATUS_PASS]);

        case 1:
          return item;

        case 3:
          return chalk.hex(LOG_COLOR_WHITE)(item);

        case 2:
          return chalk.dim(`${duration} ms`);

        case 4:
          return isZero ? emptyCell : chalk.green(item);

        case 5:
          return isZero ? emptyCell : chalk.red(item);

        case 6:
          return isZero ? emptyCell : chalk.yellow(item);

        default:
          return isZero ? emptyCell : chalk.white(item);
      }
    });

    specsResultsTable.push(row);
  });

  const overallResultsTable = new CliTable({
    chars: {
      ...tableCharsDefaults,
      'left-mid': '',
      mid: '',
      'right-mid': ''
    },
    colWidths: [12, 30]
  });

  const overallResultColor = totalFailedCount ? 'red' : 'green';
  const overallResults = [
    ['Tests:', totalCount],
    ['Passed:', totalPassedCount],
    ['Failed:', totalFailedCount],
    ['Skipped:', totalSkippedCount],
    ['Duration:', `${totalDuration} ms`]
  ].map((line) => {
    const [heading, value] = line;
    return [heading, chalk[overallResultColor](value)];
  });

  overallResults.forEach((line) => {
    overallResultsTable.push(line);
  });

  log.info(
    `  ${chalk.underline[overallResultColor].bold(
      `RESULTS: ${totalFailedCount ? 'FAILED' : 'PASSED'}`
    )}`
  );
  log.info(overallResultsTable.toString());

  const endpointSpecsResultsRows = _.filter(specsResultsTable, (arr, key) =>
    Number.isInteger(parseInt(key, 10))
  );

  const colLengths = specsResultsTableHead.map((col, index) => {
    const sortedRows = _.sortBy(
      endpointSpecsResultsRows,
      (arr) => stripAnsi(arr[index]).length
    );
    return stripAnsi(_.last(sortedRows)[index]).length;
  });

  const colLengthsWithHeader = colLengths.map((colLength, index) => {
    if (index === 2) {
      return 12;
    }

    if (specsResultsTableHead[index].length > colLength) {
      return specsResultsTableHead[index].length + 2;
    }

    return colLength + 2;
  });

  specsResultsTable.options.colWidths = colLengthsWithHeader;

  const noBordersTableChars = {
    ...tableCharsDefaults,
    bottom: '',
    'bottom-left': '',
    'bottom-right': '',
    left: ' ',
    middle: '',
    right: ' ',
    top: '',
    'top-left': '',
    'top-right': ''
  };
  const specsResultsTableTop = new CliTable({
    chars: noBordersTableChars,
    colAligns: specsResultsTableColAligns,
    colWidths: colLengthsWithHeader,
    head: specsResultsTableHead.map((header) =>
      chalk.hex(LOG_COLOR_WHITE).dim(header)
    )
  });
  const specsResultsTableBottom = new CliTable({
    chars: noBordersTableChars,
    colAligns: specsResultsTableColAligns,
    colWidths: colLengthsWithHeader
  });

  const overallResultsText = totalFailedCount
    ? chalk.red(`${totalFailedCount} of ${totalCount} failed`)
    : chalk.green('All tests passed!');

  const summaryRow = [
    totalFailedCount
      ? chalk.red(symbols[TEST_STATUS_FAIL])
      : chalk.green(symbols[TEST_STATUS_PASS]),
    overallResultsText,
    `${totalDuration} ms`,
    chalk.hex(LOG_COLOR_WHITE)(totalCount),
    totalPassedCount ? chalk.green(totalPassedCount) : emptyCell,
    totalFailedCount ? chalk.red(totalFailedCount) : emptyCell,
    totalSkippedCount ? chalk.yellow(totalSkippedCount) : emptyCell
  ].map((item) => chalk.bold(item));
  specsResultsTableBottom.push(summaryRow);

  logEmptyLines();
  logSectionDelimiter('=', 44);
  logEmptyLines();
  log.info(`  ${chalk.underline[overallResultColor].bold('DETAILS')}`);
  logEmptyLines();
  log.info(specsResultsTableTop.toString());
  log.info(specsResultsTable.toString());
  log.info(specsResultsTableBottom.toString());
  logEmptyLines(2);
};

module.exports = {
  logEmptyLines,
  logErrorAndTerminate,
  logFailedResponsePropertiesAssertion,
  logFailedResponseStatusCodeAssertion,
  logSectionDelimiter,
  logTestName,
  logTestsResults,
  logTestSuiteName
};
