const Ajv = require('ajv');
const testosaConfigData = require('../../testosa.config.json');
const log = require('../utils/log');

const testosaConfigSchema = {
  additionalProperties: false,
  properties: {
    apiBaseUrl: {
      type: 'string'
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
      minItems: 1,
      type: 'array'
    },
    excludedStatusCodes: {
      items: {
        maximum: 599,
        minimum: 200,
        type: 'integer'
      },
      minItems: 1,
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

const getTestConfig = () => {
  const ajv = new Ajv({
    $data: true,
    allErrors: true,
    strict: false,
    strictSchema: false,
    useDefaults: true
  });

  const isValidConfig = ajv.validate(testosaConfigSchema, testosaConfigData);

  if (!isValidConfig) {
    log.error(ajv.errors);
    process.exit(1);
  }

  return testosaConfigData;
};

module.exports = getTestConfig;
