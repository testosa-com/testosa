const _ = require('lodash');
const validateAjvSchema = require('./validate-ajv-schema');

const validateResponseHeaders = (responseHeadersSpecs, headers) => {
  let allErrors = [];
  const lowerCaseHeaders = {};
  _.forEach(headers, (value, key) => {
    lowerCaseHeaders[key.toString().toLowerCase()] = value;
  });

  _.forEach(responseHeadersSpecs, (spec, headerName) => {
    const lowerCaseHeaderName = headerName.toLowerCase();
    const fieldSchema = {
      properties: {
        [lowerCaseHeaderName]: spec.schema
      },
      type: 'object'
    };
    const { errors, isValid } = validateAjvSchema(fieldSchema, headers);

    if (!isValid) {
      allErrors = allErrors.concat(errors);
    }
  });

  return {
    errors: allErrors,
    isValid: !allErrors.length
  };
};

module.exports = validateResponseHeaders;
