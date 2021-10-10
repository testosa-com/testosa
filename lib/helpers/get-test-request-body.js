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

    const mapRequestBodyField = (props) => {
      const obj = {};

      _.forEach(props, (field, key) => {
        const {
          default: defaultValue,
          enum: enumValues,
          exclusiveMaximum,
          exclusiveMinimum,
          format,
          example: exampleValue,
          maximum,
          minimum,
          properties: fieldProperties,
          type: paramType
        } = field;

        const dataProperties = {
          exclusiveMaximum,
          exclusiveMinimum,
          format,
          maximum,
          minimum
        };

        const isParamTypeObject =
          paramType === 'object' ||
          (Array.isArray(paramType) && paramType.includes('object'));

        if (isParamTypeObject) {
          obj[key] = mapRequestBodyField(fieldProperties);
        } else {
          obj[key] = getTestDataValueFromSchema(
            paramType,
            dataProperties,
            defaultValue,
            exampleValue,
            enumValues
          );
        }
      });

      return obj;
    };

    testRequestBody = mapRequestBodyField(properties);
  }

  return testRequestBody;
};

module.exports = getTestRequestBody;
