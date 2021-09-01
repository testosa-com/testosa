const chance = require('chance').Chance();
const _ = require('lodash');

const getTestStringValueFromSchema = (dataProperties = {}) => {
  const { format, maxLength, minLength } = dataProperties;
  let value;

  const options = {
    length: _.random(minLength || 0, maxLength || 30)
  };

  switch (format) {
    case 'byte':
      value = chance.string(options);

      const buffer = Buffer.from(value);
      value = buffer.toString('base64');
      break;

    case 'date':
    case 'date-time':
      value = chance.date().toISOString();
      break;

    case 'email':
      chance.email({ domain: 'mock-data.testosa.com' });
      break;

    case 'uri':
      value = chance.url();
      break;

    case 'hostname':
      value = chance.domain();
      break;

    case 'ipv4':
      value = chance.ip();
      break;

    case 'ipv6':
      value = chance.ipv6();
      break;

    default:
      chance.string(options);
      break;
  }

  return value;
};

const getTestIntegerValueFromSchema = (dataProperties) => {
  const { format, maximum, minimum } = dataProperties;
  const lowerInt32Range = -2147483648;
  const upperInt32Range = 2147483647;
  const lowerInt64Range = -9223372036854775808;
  const upperInt64Range = 9223372036854775807;
  const options = {};

  switch (format) {
    case 'int32':
      options.max =
        Number.isInteger(maximum) &&
        maximum <= upperInt32Range &&
        maximum >= lowerInt32Range
          ? maximum
          : upperInt32Range;
      options.min =
        Number.isInteger(minimum) &&
        maximum <= upperInt32Range &&
        minimum >= lowerInt32Range
          ? minimum
          : lowerInt32Range;

      if (options.max < options.min) {
        options.max = upperInt32Range;
        options.min = lowerInt32Range;
      }
      break;

    case 'int64':
      options.max =
        Number.isInteger(maximum) &&
        maximum <= upperInt64Range &&
        maximum >= lowerInt64Range
          ? maximum
          : upperInt32Range;
      options.min =
        Number.isInteger(minimum) &&
        maximum <= upperInt32Range &&
        minimum >= upperInt64Range
          ? minimum
          : lowerInt64Range;

      if (options.max < options.min) {
        options.max = upperInt64Range;
        options.min = lowerInt64Range;
      }
      break;

    default:
      break;
  }

  return chance.integer(options);
};

const getTestNumberValueFromSchema = (dataProperties) => {
  const { format, maximum, minimum } = dataProperties;
  const lowerInt32Range = -2147483648;
  const upperInt32Range = 2147483647;
  const lowerInt64Range = -9223372036854775808;
  const upperInt64Range = 9223372036854775807;
  const options = {};

  switch (format) {
    case 'float':
      options.max =
        Number.isInteger(maximum) &&
        maximum <= upperInt32Range &&
        maximum >= lowerInt32Range
          ? maximum
          : upperInt32Range;
      options.min =
        Number.isInteger(minimum) &&
        maximum <= upperInt32Range &&
        minimum >= lowerInt32Range
          ? minimum
          : lowerInt32Range;

      if (options.max < options.min) {
        options.max = upperInt32Range;
        options.min = lowerInt32Range;
      }
      break;

    case 'double':
      options.max =
        Number.isInteger(maximum) &&
        maximum <= upperInt64Range &&
        maximum >= lowerInt64Range
          ? maximum
          : upperInt32Range;
      options.min =
        Number.isInteger(minimum) &&
        maximum <= upperInt32Range &&
        minimum >= upperInt64Range
          ? minimum
          : lowerInt64Range;

      if (options.max < options.min) {
        options.max = upperInt64Range;
        options.min = lowerInt64Range;
      }
      break;

    default:
      break;
  }

  return chance.integer(options);
};

const getTestDataValueFromSchema = (
  type,
  dataProperties = {},
  defaultValue,
  exampleValue,
  enumValues = []
) => {
  let value = enumValues[0];

  if (!value) {
    switch (type) {
      case 'boolean':
        value = chance.bool();
        break;

      case 'integer':
        value = getTestIntegerValueFromSchema(dataProperties);
        break;

      case 'number':
        value = getTestNumberValueFromSchema(dataProperties);
        break;

      case 'string':
        value = getTestStringValueFromSchema(dataProperties);
        break;

      default:
        break;
    }
  }

  return value;
};

module.exports = getTestDataValueFromSchema;
