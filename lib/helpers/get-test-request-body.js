const _ = require('lodash');

const getTestRequestBody = (requestBodySpec = {}) => {
  let testRequestBody;

  const {
    content: {
      'application/json': { examples: requestBodyExamples = {} } = {}
    } = {}
  } = requestBodySpec;

  _.forEach(requestBodyExamples, (example) => {
    const { value } = example;
    testRequestBody = value;
  });

  return testRequestBody;
};

module.exports = getTestRequestBody;
