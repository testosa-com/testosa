const schema = {
  additionalProperties: {
    // eslint-disable-next-line no-template-curly-in-string
    errorMessage: 'Ignoring unknown CLI config option ${0#}',
    not: true
  },
  errorMessage: {
    properties: {
      apiBaseUrl:
        // eslint-disable-next-line no-template-curly-in-string
        'Invalid config option "apiBaseUrl". Supplied value, ${/apiBaseUrl} is not a valid URI.',
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

module.exports = schema;
