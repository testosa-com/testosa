const _ = require('lodash');
const getTestDataValueFromSchema = require('./get-test-data-value-from-schema');

const getTestRequestHeaders = (params = [], contentType) => {
  const headerParams = _.filter(params, (param) =>
    ['cookie', 'header'].includes(param.in)
  );

  const testRequestHeaders = {};
  const cookies = [];

  headerParams.forEach((param) => {
    const { in: paramLocation } = param;
    const {
      name,
      schema: {
        default: defaultValue,
        format,
        enum: enumValues,
        example: exampleValue,
        maxLength,
        minLength,
        pattern,
        type: paramType
      } = {}
    } = param;
    const dataProperties = {
      format,
      maxLength,
      minLength,
      pattern
    };
    const headerValue = getTestDataValueFromSchema(
      paramType,
      dataProperties,
      defaultValue,
      exampleValue,
      enumValues
    );

    if (paramLocation === 'cookie') {
      cookies.push(`${name}=${headerValue}`);
    } else {
      testRequestHeaders[name] = headerValue;
    }
  });

  if (cookies.length) {
    testRequestHeaders.Cookie = cookies.join('; ');
  }

  if (contentType) {
    testRequestHeaders['Content-Type'] = contentType;
  }

  return testRequestHeaders;
};

module.exports = getTestRequestHeaders;
