const _ = require('lodash');

const getTestsMetaData = (pathSpecs, excludedMethods, excludedStatusCodes) => {
  const excludedMethodStrings = excludedMethods.map((method) =>
    method.toLowerCase()
  );
  const excludedStatusCodesStrings = excludedStatusCodes.map((code) =>
    code.toString()
  );
  const testsMetaData = [];

  _.forEach(pathSpecs, (pathSpec, endpoint) => {
    _.forEach(pathSpec, (options, key) => {
      if (!excludedMethodStrings.includes(key)) {
        const { operationId, responses: responsesSpec, summary } = options;

        _.forEach(responsesSpec, (responseSpec, statusCode) => {
          if (!excludedStatusCodesStrings.includes(statusCode)) {
            testsMetaData.push({
              endpoint,
              method: key,
              operationId,
              statusCode,
              summary
            });
          }
        });
      }
    });
  });

  return testsMetaData;
};

module.exports = getTestsMetaData;
