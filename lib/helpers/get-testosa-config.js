const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const ajvErrors = require('ajv-errors');
const ajvFormats = require('ajv-formats');
const chalk = require('chalk');
const log = require('../utils/log');
const { logEmptyLines } = require('./log');

const testosaConfigSchema = {
  additionalProperties: {
    // eslint-disable-next-line no-template-curly-in-string
    errorMessage: 'Ignoring unknown CLI config option ${0#}',
    not: true
  },
  errorMessage: {
    properties: {
      apiBaseUrl:
        // eslint-disable-next-line no-template-curly-in-string
        'Invalid config option "apiBaseUrl". Supplied value, "${/apiBaseUrl}" is not a valid URI.',
      apiServerStartupTimeout:
        'Invalid config option "apiServerStartupTimeout". Value must be a positive integer',
      excludedMethods:
        'Invalid config option "excludedMethods". Array must only include one or more of the following HTTP methods: "DELETE", "GET", "OPTIONS", "PATCH", "POST", "PUT", "TRACE".',
      excludedStatusCodes:
        'Invalid config option "excludedStatusCodes". Array must only include HTTP status code integer values between 200 and 599.'
    }
  },
  properties: {
    $0: {
      type: 'string'
    },
    _: {
      type: 'array'
    },
    apiBaseUrl: {
      format: 'uri',
      type: 'string'
    },
    apiServerStartupTimeout: {
      defaultValue: 5000,
      minimum: 0,
      type: 'integer'
    },
    excludedMethods: {
      items: {
        enum: [
          'delete',
          'DELETE',
          'get',
          'GET',
          'options',
          'OPTIONS',
          'patch',
          'PATCH',
          'post',
          'POST',
          'put',
          'PUT',
          'trace',
          'TRACE'
        ],
        type: 'string'
      },
      type: 'array'
    },
    excludedStatusCodes: {
      items: {
        maximum: 599,
        minimum: 200,
        type: 'integer'
      },
      type: 'array'
    },
    hooksFilePath: {
      type: 'string'
    },
    openapiFilePath: {
      type: 'string'
    }
  },
  required: ['apiBaseUrl', 'openapiFilePath'],
  type: 'object'
};

const getTestosaConfigFromFile = () => {
  const testosaConfigFilePath = path.resolve(
    process.cwd(),
    './testosa.config.json'
  );

  if (fs.existsSync(testosaConfigFilePath)) {
    // eslint-disable-next-line
    return require(testosaConfigFilePath);
  }

  return {};
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

const getTestosaConfig = (cliOptions) => {
  const ajv = new Ajv({
    $data: true,
    allErrors: true,
    strict: false,
    strictSchema: false,
    useDefaults: true
  });
  ajvErrors(ajv);
  ajvFormats(ajv);

  const configFileData = getTestosaConfigFromFile();

  const testosaConfigData = {
    ...configFileData,
    ...cliOptions
  };

  const isValidConfig = ajv.validate(testosaConfigSchema, testosaConfigData);

  if (!isValidConfig) {
    logConfigValidationErrors(ajv.errors);
  }

  return testosaConfigData;
};

module.exports = getTestosaConfig;
