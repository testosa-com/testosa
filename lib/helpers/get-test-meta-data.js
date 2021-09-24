const _ = require('lodash');

const getTestsMetaData = (
  pathSpecs,
  excludedMethods = [],
  excludedStatusCodes = []
) => {
  const excludedMethodStrings = excludedMethods.map((method) =>
    method.toLowerCase()
  );
  const excludedStatusCodesStrings = excludedStatusCodes.map((code) =>
    code.toString()
  );
  const testsMetaData = [];

  _.forEach(pathSpecs, (pathSpec, endpoint) => {
    _.forEach(pathSpec, (options, key) => {
      let skip = excludedMethodStrings.includes(key);

      const {
        operationId,
        requestBody: requestBodySpec = {},
        responses: responsesSpec,
        summary
      } = options;

      _.forEach(responsesSpec, (responseSpec, statusCode) => {
        skip = skip || excludedStatusCodesStrings.includes(statusCode);

        // Get first request content type in path spec
        const [requestBodyContentType] = !_.isEmpty(requestBodySpec.content)
          ? Object.keys(requestBodySpec.content)
          : [];
        testsMetaData.push({
          endpoint,
          method: key,
          operationId,
          requestBodyContentType,
          skip,
          statusCode,
          summary
        });
      });
    });
  });

  return testsMetaData;
};

module.exports = getTestsMetaData;
