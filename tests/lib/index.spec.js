const axios = require('axios');
const chance = require('chance').Chance();
const {
  TEST_HOOK_AFTER_ALL,
  TEST_HOOK_AFTER_EACH,
  TEST_HOOK_BEFORE_ALL,
  TEST_HOOK_BEFORE_EACH
} = require('../../lib/constants/test-hooks');
const {
  TEST_STATUS_FAIL,
  TEST_STATUS_PASS,
  TEST_STATUS_SKIP
} = require('../../lib/constants/test-statues');
const checkApiAccessibility = require('../../lib/helpers/check-api-accessibility');
const getAxiosConfig = require('../../lib/helpers/get-axios-config');
const getOpenApiSpec = require('../../lib/helpers/get-open-api-spec');
const getResolvedTestEndpoint = require('../../lib/helpers/get-resolved-test-endpoint');
const getTestsMetaData = require('../../lib/helpers/get-test-meta-data');
const getTestRequestBody = require('../../lib/helpers/get-test-request-body');
const getTestosaConfig = require('../../lib/helpers/get-testosa-config');
const {
  logEmptyLines,
  logFailedResponsePropertiesAssertion,
  logFailedResponseStatusCodeAssertion,
  logTestName,
  logTestsResults,
  logTestSuiteName
} = require('../../lib/helpers/log');
const triggerHook = require('../../lib/helpers/trigger-hook');
const validateAjvSchema = require('../../lib/helpers/validate-ajv-schema');
const validateResponseHeaders = require('../../lib/helpers/validate-response-headers');
const validateResponseStatusCode = require('../../lib/helpers/validate-response-status-code');
const testOpenApiPaths = require('../../lib/index');
const log = require('../../lib/utils/log');
const generateSpecName = require('../__helpers/generate-spec-name');

jest.mock('axios');
jest.mock('../../lib/helpers/check-api-accessibility');
jest.mock('../../lib/helpers/get-axios-config');
jest.mock('../../lib/helpers/get-open-api-spec');
jest.mock('../../lib/helpers/get-test-meta-data');
jest.mock('../../lib/helpers/get-test-request-body');
jest.mock('../../lib/helpers/get-testosa-config');
jest.mock('../../lib/helpers/get-resolved-test-endpoint');
jest.mock('../../lib/helpers/validate-ajv-schema');
jest.mock('../../lib/helpers/validate-response-headers');
jest.mock('../../lib/helpers/validate-response-status-code');
jest.mock('../../lib/helpers/log');
jest.mock('../../lib/helpers/trigger-hook');

describe(generateSpecName(), () => {
  let specRequestBodyContentType;
  let specMethod;
  let specStatusCode;
  let testosaOptions;
  let testosaConfig;
  let isCli;
  let openApiSpec;
  let testsMetaData;
  let logInfoSpy;
  let logErrorSpy;

  beforeEach(() => {
    specMethod = chance.string();
    specStatusCode = chance.integer({
      max: 599,
      min: 200
    });
    specRequestBodyContentType = chance.string();
    testosaConfig = {
      apiBaseUrl: chance.string(),
      apiServerStartupTimeout: chance.integer({ min: 0 }),
      excludedMethods: [],
      excludedStatusCodes: [],
      hooksFilePath: chance.string(),
      openApiFilePath: chance.string()
    };
    getTestosaConfig.mockImplementation(() => testosaConfig);

    checkApiAccessibility.mockImplementation(() => true);

    const endpoint = chance.string();
    const operationId = chance.string();
    const summary = chance.string();
    openApiSpec = {
      paths: {
        [endpoint]: {
          [specMethod]: {
            responses: {
              [specStatusCode]: {
                content: {
                  [specRequestBodyContentType]: {
                    schema: {
                      properties: {}
                    }
                  }
                }
              }
            },
            summary
          }
        }
      }
    };
    getOpenApiSpec.mockImplementation(() => openApiSpec);

    testsMetaData = [
      {
        endpoint,
        method: specMethod,
        operationId,
        requestBodyContentType: specRequestBodyContentType,
        skip: false,
        statusCode: specMethod,
        summary
      }
    ];
    getTestsMetaData.mockImplementation(() => testsMetaData);

    triggerHook.mockImplementation(() => {});

    getAxiosConfig.mockImplementation(() => {
      return {};
    });

    axios.mockImplementation(() => {});

    validateAjvSchema.mockImplementation(() => {
      return {
        errors: [],
        isValid: true
      };
    });

    validateResponseHeaders.mockImplementation(() => {
      return {
        errors: [],
        isValid: true
      };
    });

    validateResponseStatusCode.mockImplementation(() => {
      return {
        error: undefined,
        isValid: true
      };
    });

    logEmptyLines.mockImplementation(() => {});
    logFailedResponsePropertiesAssertion.mockImplementation(() => {});
    logFailedResponseStatusCodeAssertion.mockImplementation(() => {});
    logTestName.mockImplementation(() => {});
    logTestsResults.mockImplementation(() => {});
    logTestSuiteName.mockImplementation(() => {});

    logInfoSpy = jest.spyOn(log, 'info').mockImplementation(() => {});
    logErrorSpy = jest.spyOn(log, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    logInfoSpy.mockReset();
    logErrorSpy.mockReset();
  });

  describe('passing specs', () => {
    it('should generate a test and log the results', async () => {
      await testOpenApiPaths(testosaOptions, isCli);

      expect(getTestosaConfig).toHaveBeenCalledWith(testosaOptions, isCli);
      expect(checkApiAccessibility).toHaveBeenCalledWith(
        testosaConfig.apiBaseUrl,
        testosaConfig.apiServerStartupTimeout
      );
      expect(getOpenApiSpec).toHaveBeenCalledWith(
        testosaConfig.openApiFilePath
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_ALL
      );
      const [testMetaData] = testsMetaData;
      const { method, summary, endpoint } = testMetaData;
      expect(logTestSuiteName).toHaveBeenCalledWith(method, summary, endpoint);
      expect(getTestRequestBody).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_EACH,
        expect.any(Object)
      );
      expect(getResolvedTestEndpoint).toHaveBeenCalled();
      expect(getAxiosConfig).toHaveBeenLastCalledWith(
        testosaConfig.apiBaseUrl,
        expect.any(Object)
      );
      expect(axios).toHaveBeenCalledWith(expect.any(Object));
      expect(validateAjvSchema).toHaveBeenCalled();
      expect(validateResponseHeaders).toHaveBeenCalled();
      expect(validateResponseStatusCode).toHaveBeenCalled();
      expect(logTestName).toHaveBeenCalledTimes(1);
      expect(logTestName).toHaveBeenCalledWith(
        TEST_STATUS_PASS,
        expect.objectContaining(testMetaData)
      );
      expect(logTestsResults).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFailure: expect.any(Boolean),
          specs: expect.any(Object),
          totalCount: expect.any(Number),
          totalDuration: expect.any(Number)
        })
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_EACH,
        expect.any(Object)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_ALL
      );
      expect(triggerHook).toHaveBeenCalledTimes(4);
    });
  });

  describe('skipped specs', () => {
    it('should skip a test if test meta data `skip` value is true', async () => {
      testsMetaData[0].skip = true;

      getTestsMetaData.mockImplementation(() => testsMetaData);

      await testOpenApiPaths(testosaOptions, isCli);

      expect(getTestosaConfig).toHaveBeenCalledWith(testosaOptions, isCli);
      expect(checkApiAccessibility).toHaveBeenCalledWith(
        testosaConfig.apiBaseUrl,
        testosaConfig.apiServerStartupTimeout
      );
      expect(getOpenApiSpec).toHaveBeenCalledWith(
        testosaConfig.openApiFilePath
      );
      expect(getTestRequestBody).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_EACH,
        expect.any(Object)
      );
      expect(getResolvedTestEndpoint).toHaveBeenCalled();
      const [testMetaData] = testsMetaData;
      expect(axios).not.toHaveBeenCalled();
      expect(validateAjvSchema).not.toHaveBeenCalled();
      expect(validateResponseHeaders).not.toHaveBeenCalled();
      expect(validateResponseStatusCode).not.toHaveBeenCalled();
      expect(logTestName).toHaveBeenCalledTimes(1);
      expect(logTestName).toHaveBeenCalledWith(
        TEST_STATUS_SKIP,
        expect.objectContaining(testMetaData)
      );
      expect(logTestsResults).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFailure: expect.any(Boolean),
          specs: expect.any(Object),
          totalCount: expect.any(Number),
          totalDuration: expect.any(Number)
        })
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_EACH,
        expect.any(Object)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_ALL
      );
      expect(triggerHook).toHaveBeenCalledTimes(4);
    });
  });

  describe('failing specs', () => {
    it('should fail a test if the response body does not match the schema', async () => {
      validateAjvSchema.mockImplementation(() => {
        return {
          errors: [{}],
          isValid: false
        };
      });
      await testOpenApiPaths(testosaOptions, isCli);

      expect(getTestosaConfig).toHaveBeenCalledWith(testosaOptions, isCli);
      expect(checkApiAccessibility).toHaveBeenCalledWith(
        testosaConfig.apiBaseUrl,
        testosaConfig.apiServerStartupTimeout
      );
      expect(getOpenApiSpec).toHaveBeenCalledWith(
        testosaConfig.openApiFilePath
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_ALL
      );
      const [testMetaData] = testsMetaData;
      const { method, summary, endpoint } = testMetaData;
      expect(logTestSuiteName).toHaveBeenCalledWith(method, summary, endpoint);
      expect(getTestRequestBody).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_EACH,
        expect.any(Object)
      );
      expect(getResolvedTestEndpoint).toHaveBeenCalled();
      expect(getAxiosConfig).toHaveBeenLastCalledWith(
        testosaConfig.apiBaseUrl,
        expect.any(Object)
      );
      expect(axios).toHaveBeenCalledWith(expect.any(Object));
      expect(validateAjvSchema).toHaveBeenCalled();
      expect(validateResponseHeaders).toHaveBeenCalled();
      expect(validateResponseStatusCode).toHaveBeenCalled();
      expect(logTestName).toHaveBeenCalledTimes(1);
      expect(logTestName).toHaveBeenCalledWith(
        TEST_STATUS_FAIL,
        expect.objectContaining(testMetaData)
      );
      expect(logFailedResponsePropertiesAssertion).toHaveBeenCalled();
      expect(logEmptyLines).toHaveBeenCalled();
      expect(logTestsResults).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFailure: expect.any(Boolean),
          specs: expect.any(Object),
          totalCount: expect.any(Number),
          totalDuration: expect.any(Number)
        })
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_EACH,
        expect.any(Object)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_ALL
      );
      expect(triggerHook).toHaveBeenCalledTimes(4);
    });

    it('should fail a test if the response header does not match the schema', async () => {
      validateResponseHeaders.mockImplementation(() => {
        return {
          errors: [{}],
          isValid: false
        };
      });
      await testOpenApiPaths(testosaOptions, isCli);

      expect(getTestosaConfig).toHaveBeenCalledWith(testosaOptions, isCli);
      expect(checkApiAccessibility).toHaveBeenCalledWith(
        testosaConfig.apiBaseUrl,
        testosaConfig.apiServerStartupTimeout
      );
      expect(getOpenApiSpec).toHaveBeenCalledWith(
        testosaConfig.openApiFilePath
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_ALL
      );
      const [testMetaData] = testsMetaData;
      const { method, summary, endpoint } = testMetaData;
      expect(logTestSuiteName).toHaveBeenCalledWith(method, summary, endpoint);
      expect(getTestRequestBody).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_EACH,
        expect.any(Object)
      );
      expect(getResolvedTestEndpoint).toHaveBeenCalled();
      expect(getAxiosConfig).toHaveBeenLastCalledWith(
        testosaConfig.apiBaseUrl,
        expect.any(Object)
      );
      expect(axios).toHaveBeenCalledWith(expect.any(Object));
      expect(validateAjvSchema).toHaveBeenCalled();
      expect(validateResponseHeaders).toHaveBeenCalled();
      expect(validateResponseStatusCode).toHaveBeenCalled();
      expect(logTestName).toHaveBeenCalledTimes(1);
      expect(logTestName).toHaveBeenCalledWith(
        TEST_STATUS_FAIL,
        expect.objectContaining(testMetaData)
      );
      expect(logFailedResponsePropertiesAssertion).toHaveBeenCalled();
      expect(logEmptyLines).toHaveBeenCalled();
      expect(logTestsResults).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFailure: expect.any(Boolean),
          specs: expect.any(Object),
          totalCount: expect.any(Number),
          totalDuration: expect.any(Number)
        })
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_EACH,
        expect.any(Object)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_ALL
      );
      expect(triggerHook).toHaveBeenCalledTimes(4);
    });

    it('should fail a test if the response status does not match the schema', async () => {
      validateResponseStatusCode.mockImplementation(() => {
        return {
          error: {},
          isValid: false
        };
      });
      await testOpenApiPaths(testosaOptions, isCli);

      expect(getTestosaConfig).toHaveBeenCalledWith(testosaOptions, isCli);
      expect(checkApiAccessibility).toHaveBeenCalledWith(
        testosaConfig.apiBaseUrl,
        testosaConfig.apiServerStartupTimeout
      );
      expect(getOpenApiSpec).toHaveBeenCalledWith(
        testosaConfig.openApiFilePath
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_ALL
      );
      const [testMetaData] = testsMetaData;
      const { method, summary, endpoint } = testMetaData;
      expect(logTestSuiteName).toHaveBeenCalledWith(method, summary, endpoint);
      expect(getTestRequestBody).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_BEFORE_EACH,
        expect.any(Object)
      );
      expect(getResolvedTestEndpoint).toHaveBeenCalled();
      expect(getAxiosConfig).toHaveBeenLastCalledWith(
        testosaConfig.apiBaseUrl,
        expect.any(Object)
      );
      expect(axios).toHaveBeenCalledWith(expect.any(Object));
      expect(validateAjvSchema).toHaveBeenCalled();
      expect(validateResponseHeaders).toHaveBeenCalled();
      expect(validateResponseStatusCode).toHaveBeenCalled();
      expect(logTestName).toHaveBeenCalledTimes(1);
      expect(logTestName).toHaveBeenCalledWith(
        TEST_STATUS_FAIL,
        expect.objectContaining(testMetaData)
      );
      expect(logFailedResponseStatusCodeAssertion).toHaveBeenCalled();
      expect(logEmptyLines).toHaveBeenCalled();
      expect(logTestsResults).toHaveBeenCalledWith(
        expect.objectContaining({
          hasFailure: expect.any(Boolean),
          specs: expect.any(Object),
          totalCount: expect.any(Number),
          totalDuration: expect.any(Number)
        })
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_EACH,
        expect.any(Object)
      );
      expect(triggerHook).toHaveBeenCalledWith(
        testosaConfig.hooksFilePath,
        TEST_HOOK_AFTER_ALL
      );
      expect(triggerHook).toHaveBeenCalledTimes(4);
    });
  });
});
