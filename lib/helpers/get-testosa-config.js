const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const _ = require('lodash');
const testosaConfigSchema = require('../schemas/testosa-config');
const log = require('../utils/log');
const { logEmptyLines, logErrorAndTerminate } = require('./log');
const validateAjvSchema = require('./validate-ajv-schema');

const getTestosaConfigFromFile = (filePath) => {
  let configFileData = {};

  if (fs.existsSync(filePath)) {
    try {
      const configFileRawData = fs.readFileSync(filePath, 'utf8');

      configFileData = JSON.parse(configFileRawData);
    } catch (error) {
      logErrorAndTerminate(
        `Error while reading Testosa config file at ${filePath}\n - ${error.message}`
      );
    }
  }

  return configFileData;
};

const logConfigValidationErrors = (errors) => {
  const isPluralErrors = errors.length !== 1;
  log.error(
    chalk.bold(`Config validation ${isPluralErrors ? 'errors' : 'error'}:`)
  );

  errors.forEach((error) => {
    const { instancePath = '', keyword, message, params } = error;

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

    switch (true) {
      case keyword === 'required':
        const { missingProperty } = params;
        log.error(` - Missing required config option "${missingProperty}"`);
        break;

      case keyword === 'type':
        const expectedFormat = params.type.split(',').join(' OR ');
        log.error(
          ` - Invalid config option. Expected "${trimmedDataPath}" to be of type ${expectedFormat}`
        );
        break;

      case !!message:
        log.error(` - ${message}`);
        break;

      default:
        break;
    }
  });

  logEmptyLines();
  process.exit(1);
};

const resolveFilePath = (filePath, propertyName) => {
  let resolvedFilePath;

  if (_.isString(filePath)) {
    if (_.trim(filePath).length) {
      resolvedFilePath = path.resolve(process.cwd(), _.trim(filePath));

      if (!fs.existsSync(resolvedFilePath)) {
        testosaConfigSchema.errorMessage.properties[
          propertyName
        ] = `Invalid path supplied for "${propertyName}". File: "${resolvedFilePath}" not found.`;

        resolvedFilePath = null;
      }
    } else {
      testosaConfigSchema.errorMessage.properties[
        propertyName
      ] = `Invalid path supplied for "${propertyName}". Value must not be empty.`;

      resolvedFilePath = null;
    }
  } else {
    resolvedFilePath = filePath;
  }

  return resolvedFilePath;
};

const getTestosaConfig = (options, isCli, configFilePath) => {
  const configFileOptions = isCli
    ? getTestosaConfigFromFile(configFilePath)
    : {};

  const testosaConfigData = {
    ...configFileOptions,
    ...options
  };

  const { hooksFilePath, openApiFilePath } = testosaConfigData;
  testosaConfigData.hooksFilePath = resolveFilePath(
    hooksFilePath,
    'hooksFilePath'
  );

  testosaConfigData.openApiFilePath = resolveFilePath(
    openApiFilePath,
    'openApiFilePath'
  );

  const { errors, isValid } = validateAjvSchema(
    testosaConfigSchema,
    testosaConfigData
  );

  if (!isValid) {
    logConfigValidationErrors(errors);
  }

  return testosaConfigData;
};

module.exports = getTestosaConfig;
