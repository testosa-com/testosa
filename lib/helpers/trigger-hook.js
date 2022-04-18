const chalk = require('chalk');
const _ = require('lodash');
const {
  TEST_HOOK_AFTER_ALL,
  TEST_HOOK_AFTER_EACH,
  TEST_HOOK_BEFORE_ALL,
  TEST_HOOK_BEFORE_EACH
} = require('../constants/test-hooks');
const transactionActualResponseSchema = require('../schemas/transaction-actual-response');
const log = require('../utils/log');
const validateAjvSchema = require('./validate-ajv-schema');

const logValidationErrors = (errors, hookName) => {
  log.warn(
    chalk.bold(
      `       Warning: transaction in ${hookName}() was improperly updated. Falling back to original transaction object:`
    )
  );

  errors.forEach((error) => {
    const { instancePath = '', keyword, message, params } = error;

    const regexReplaceFirstSlash = /\//;
    const regexReplaceRemainingSlashes = /\//g;

    /* eslint-disable indent */
    const trimmedDataPath =
      instancePath === ''
        ? instancePath
        : instancePath
            .replace(regexReplaceFirstSlash, '')
            .replace(regexReplaceRemainingSlashes, '.');
    /* eslint-enable indent */

    switch (true) {
      case keyword === 'required':
        const { missingProperty } = params;
        log.warn(
          ` - Missing required value at {}.actual.request.${missingProperty}`
        );
        break;

      case keyword === 'type':
        const expectedFormat = params.type.split(',').join(' OR ');
        log.warn(
          `        - Invalid value at {}.actual.request.${trimmedDataPath}. Expected value to be of type ${expectedFormat}`
        );
        break;

      case !!message:
        log.warn(` - ${message}`);
        break;

      default:
        break;
    }
  });
};

const validateTransactionUpdate = (actualRequestObj, skip, hookName) => {
  const {
    errors: actualRequestObjectValidationErrors,
    isValid: isValidActualRequestObject
  } = validateAjvSchema(transactionActualResponseSchema, actualRequestObj);
  const isValidSkipValue = typeof skip === 'boolean';

  if (!isValidActualRequestObject) {
    logValidationErrors(actualRequestObjectValidationErrors, hookName);
  }

  if (!isValidSkipValue) {
    log.warn(
      chalk.bold(
        `       Warning: transaction in ${hookName}() was improperly updated. Falling back to original transaction object:`
      )
    );
    log.warn(
      `        - Expected value at {}.skip to be true or false. Received: ${skip}`
    );
  }

  return isValidActualRequestObject && isValidSkipValue;
};

const triggerHook = async (hooksFilePath, hookName, prevTransaction) => {
  let nextTransaction = _.cloneDeep(prevTransaction);
  const supportedHooks = [
    TEST_HOOK_AFTER_ALL,
    TEST_HOOK_AFTER_EACH,
    TEST_HOOK_BEFORE_ALL,
    TEST_HOOK_BEFORE_EACH
  ];

  if (hooksFilePath && supportedHooks.includes(hookName)) {
    // eslint-disable-next-line
    const { [hookName]: hook } = require(hooksFilePath);

    if (_.isFunction(hook)) {
      const arg =
        hookName === TEST_HOOK_BEFORE_EACH ? nextTransaction : undefined;

      let updatedTransaction =
        hook instanceof (async () => {}).constructor
          ? await hook(arg)
          : hook(arg);

      switch (true) {
        case hookName === TEST_HOOK_BEFORE_EACH:
          updatedTransaction = updatedTransaction || nextTransaction;
          updatedTransaction.actual = updatedTransaction.actual || {};
          const isValidTransaction = validateTransactionUpdate(
            updatedTransaction.actual.request,
            updatedTransaction.skip,
            hookName
          );

          if (isValidTransaction) {
            nextTransaction.actual.request = updatedTransaction.actual.request;
            nextTransaction.skip = updatedTransaction.skip;
          }
          break;

        case hookName === TEST_HOOK_AFTER_ALL:
        case hookName === TEST_HOOK_AFTER_EACH:
        case hookName === TEST_HOOK_BEFORE_ALL:
          if (updatedTransaction !== undefined) {
            log.warn(
              `       Warning: No return value value is expected in ${hookName}() hook. Ignoring returned transaction.`
            );
            nextTransaction = prevTransaction;
          }
          break;

        default:
          break;
      }
    }
  }

  return nextTransaction;
};

module.exports = triggerHook;
