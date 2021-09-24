const _ = require('lodash');
const getTestDataValueFromSchema = require('./get-test-data-value-from-schema');

const getTestRequestBody = (requestBodySpec, contentType) => {
  let testRequestBody;

  const examples =
    _.get(requestBodySpec, `content[${contentType}].examples`) || {};
  const properties =
    _.get(requestBodySpec, `content[${contentType}].schema.properties`) || {};

  const firstExampleKey = Object.keys(examples)[0];
  const { value: exampleBody } = examples[firstExampleKey] || {};
  testRequestBody = exampleBody;

  if (!exampleBody) {
    testRequestBody = {};

    _.forEach(properties, (field, key) => {
      const {
        default: defaultValue,
        enum: enumValues,
        exclusiveMaximum,
        exclusiveMinimum,
        format,
        example: exampleValue,
        maximum,
        minimum,
        type: paramType
      } = field;

      const dataProperties = {
        exclusiveMaximum,
        exclusiveMinimum,
        format,
        maximum,
        minimum
      };

      testRequestBody[key] = getTestDataValueFromSchema(
        paramType,
        dataProperties,
        defaultValue,
        exampleValue,
        enumValues
      );
    });
  }

  return testRequestBody;
};

module.exports = getTestRequestBody;
