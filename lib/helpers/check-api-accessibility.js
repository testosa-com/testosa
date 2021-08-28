const isReachable = require('is-reachable');
const { logErrorAndTerminate } = require('./log');

const checkApiAccessibility = async (apiBaseUrl, apiServerStartupTimeout) => {
  const options = {
    timeout: apiServerStartupTimeout
  };

  const isApiServerReachable = await isReachable(apiBaseUrl, options);

  if (!isApiServerReachable) {
    logErrorAndTerminate(`Your API is unreachable at ${apiBaseUrl}`);
  }
};

module.exports = checkApiAccessibility;
