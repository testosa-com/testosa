const chance = require('chance').Chance();
const isReachable = require('is-reachable');
const checkApiAccessibilitySpec = require('../../../lib/helpers/check-api-accessibility');
const { logErrorAndTerminate } = require('../../../lib/helpers/log');
const generateSpecName = require('../../__helpers/generate-spec-name');

jest.mock('is-reachable');
jest.mock('../../../lib/helpers/log');

describe(generateSpecName(), () => {
  const apiBaseUrl = chance.url({ domain: 'mock-data.testosa.com' });
  const apiServerStartupTimeout = chance.integer({
    max: 100000,
    min: 0
  });

  beforeEach(() => {
    isReachable.mockImplementation(() => false);
    logErrorAndTerminate.mockImplementation(jest.fn());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should exit successfully if able to reach server', async () => {
    isReachable.mockImplementation(() => true);
    await checkApiAccessibilitySpec(apiBaseUrl, apiServerStartupTimeout);
    const options = {
      timeout: apiServerStartupTimeout
    };
    expect(isReachable).toHaveBeenCalledWith(apiBaseUrl, options);
    expect(logErrorAndTerminate).not.toHaveBeenCalled();
  });

  it('should log error and terminate if unable to reach server', async () => {
    await checkApiAccessibilitySpec(apiBaseUrl, apiServerStartupTimeout);
    const options = {
      timeout: apiServerStartupTimeout
    };
    expect(isReachable).toHaveBeenCalledWith(apiBaseUrl, options);
    expect(logErrorAndTerminate).toHaveBeenCalledWith(expect.any(String));
  });
});
