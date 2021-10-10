const _ = require('lodash');
const qs = require('qs');
const getTestDataValueFromSchema = require('./get-test-data-value-from-schema');

const getResolvedTestEndpoint = (
  endpoint,
  pathLevelParamsSpecs,
  operationLevelParamsSpecs
) => {
  let resolvedTestEndpoint = endpoint;
  const query = {};

  const allParamsSpecs = _.chain(pathLevelParamsSpecs)
    .concat(operationLevelParamsSpecs)
    .filter((o) => o && o.deprecated !== true)
    .uniqBy((o) => o && `${o.in}-${o.name}`)
    .compact()
    .value();

  _.forEach(allParamsSpecs, (spec) => {
    const {
      in: paramLocation,
      name: paramName,
      required: isRequired,
      schema: {
        default: defaultValue,
        enum: enumValues,
        exclusiveMaximum,
        exclusiveMinimum,
        format,
        example: exampleValue,
        maximum,
        minimum,
        type: paramType
      }
    } = spec;
    const dataProperties = {
      exclusiveMaximum,
      exclusiveMinimum,
      format,
      maximum,
      minimum
    };

    switch (paramLocation) {
      case 'path':
        const pathParamValue = getTestDataValueFromSchema(
          paramType,
          dataProperties,
          defaultValue,
          exampleValue,
          enumValues
        );
        const replaceAllRegex = new RegExp(`{${paramName}}`, 'g');
        resolvedTestEndpoint = resolvedTestEndpoint.replace(
          replaceAllRegex,
          pathParamValue
        );
        break;

      case 'query':
        if (isRequired) {
          query[paramName] = getTestDataValueFromSchema(
            paramType,
            dataProperties,
            defaultValue,
            exampleValue,
            enumValues
          );
        }
        break;

      default:
        break;
    }

    const queryString = qs.stringify(query);

    if (queryString) {
      resolvedTestEndpoint += `?${queryString}`;
    }
  });

  return resolvedTestEndpoint;
};

module.exports = getResolvedTestEndpoint;
