const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajvErrors = require('ajv-errors');
const ajvFormats = require('ajv-formats');
const chalk = require('chalk');
const _ = require('lodash');
const testosaConfigSchema = require('../schemas/testosa-config');
const log = require('../utils/log');
const { logEmptyLines, logErrorAndTerminate } = require('./log');

const getTestosaConfigFromFile = () => {
  const testosaConfigFilePath = path.resolve(
    process.cwd(),
    './testosa.config.json'
  );

  let configFileData = {};

  if (fs.existsSync(testosaConfigFilePath)) {
    // eslint-disable-next-line

    try {
      const configFileRawData = fs.readFileSync(testosaConfigFilePath, 'utf8');

      configFileData = JSON.parse(configFileRawData);
    } catch (error) {
      logErrorAndTerminate(
        `Error while reading Testosa config file at ${testosaConfigFilePath}\n - ${error.message}`
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

const getTestosaConfig = (options, isCli) => {
  const ajv = new Ajv({
    $data: true,
    allErrors: true,
    strict: false,
    strictSchema: false,
    useDefaults: true
  });
  ajvErrors(ajv);
  ajvFormats(ajv);

  const configFileOptions = isCli ? getTestosaConfigFromFile() : {};

  const testosaConfigData = {
    ...configFileOptions,
    ...options
  };

  const { hooksFilePath, openapiFilePath } = testosaConfigData;
  testosaConfigData.hooksFilePath = resolveFilePath(
    hooksFilePath,
    'hooksFilePath'
  );

  testosaConfigData.openapiFilePath = resolveFilePath(
    openapiFilePath,
    'openapiFilePath'
  );

  const isValidConfig = ajv.validate(testosaConfigSchema, testosaConfigData);

  if (!isValidConfig) {
    logConfigValidationErrors(ajv.errors);
  }

  return testosaConfigData;
};

module.exports = getTestosaConfig;
