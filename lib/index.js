const fs = require('fs');
const swaggerParser = require('@apidevtools/swagger-parser');
const axios = require('axios');
const _ = require('lodash');
const {
  TEST_STATUS_FAIL,
  TEST_STATUS_PASS,
  TEST_STATUS_SKIP
} = require('./constants/test-statues');
const checkApiAccessibility = require('./helpers/check-api-accessibility');
const getResolvedTestEndpoint = require('./helpers/get-resolved-test-endpoint');
const getTestRequestBody = require('./helpers/get-test-request-body');
const getTestosaConfig = require('./helpers/get-testosa-config');
const {
  logEmptyLines,
  logErrorAndTerminate,
  logFailedResponseBodyAssertion,
  logFailedResponseStatusCodeAssertion,
  logTestName,
  logTestsResults,
  logTestSuiteName
} = require('./helpers/log');
const validateResponseBodySchema = require('./helpers/validate-response-body-schema');
const validateResponseStatusCode = require('./helpers/validate-response-status-code');
const log = require('./utils/log');

const getAxiosConfig = (apiBaseUrl, transaction) => {
  const {
    actual: {
      request: { body: data, headers, method, resolvedPath }
    }
  } = transaction;

  return {
    data,
    headers,
    method,
    url: `${apiBaseUrl}${resolvedPath}`
  };
};

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

const triggerHook = async (hooksFilePath, hookName, transaction) => {
  let updatedTransaction = _.cloneDeep(transaction);

  if (hooksFilePath) {
    // eslint-disable-next-line
    const { [hookName]: hook } = require(hooksFilePath);

    if (_.isFunction(hook)) {
      updatedTransaction =
        hook instanceof (async () => {}).constructor
          ? await hook(transaction)
          : hook(transaction);
    }
  }

  return updatedTransaction;
};

const getOpenApiSpec = async (openApiFilePath) => {
  let resolveOpenApiSpec;
  let openApiSpec;

  try {
    const openApiSpecRaw = fs.readFileSync(openApiFilePath);
    openApiSpec = JSON.parse(openApiSpecRaw);

    resolveOpenApiSpec = await swaggerParser.validate(openApiSpec);
    const { swagger, openapi } = resolveOpenApiSpec;
    const specVersion = swagger || openapi || '';

    if (!specVersion.startsWith('3')) {
      logErrorAndTerminate(
        `Unsupported OpenAPI version: ${specVersion}. Testosa currently supports OpenAPI Specification version 3 or higher.`
      );
    }
  } catch (error) {
    logErrorAndTerminate(error);
  }

  return resolveOpenApiSpec;
};

const testOpenApiPaths = async (options, isCli) => {
  const {
    apiBaseUrl,
    apiServerStartupTimeout,
    excludedMethods,
    excludedStatusCodes,
    hooksFilePath,
    openApiFilePath
  } = getTestosaConfig(options, isCli);

  await checkApiAccessibility(apiBaseUrl, apiServerStartupTimeout);

  const { paths: pathSpecs } = await getOpenApiSpec(openApiFilePath);
  const testsMetaData = getTestsMetaData(
    pathSpecs,
    excludedMethods,
    excludedStatusCodes
  );

  const testsResults = {
    failedCount: 0,
    passedCount: 0,
    skippedCount: 0,
    startTime: Date.now(),
    totalCount: testsMetaData.length
  };

  await triggerHook(hooksFilePath, 'beforeAll');

  // Filter to whitelisted tests
  for (let i = 0; i < testsMetaData.length; i++) {
    const testMetaData = testsMetaData[i];
    const { endpoint, method, operationId, statusCode, summary } = testMetaData;
    const startTime = Date.now();

    let isNextTestSuite = true;
    if (i !== 0) {
      isNextTestSuite =
        method !== testsMetaData[i - 1].method ||
        endpoint !== testsMetaData[i - 1].endpoint;
    }

    if (isNextTestSuite) {
      logTestSuiteName(method, summary, endpoint);
    }

    const {
      [method]: {
        requestBody,
        responses: {
          [statusCode]: {
            content: {
              'application/json': { schema: responseBodySchema }
            }
          }
        },
        parameters: operationLevelParamsSpecs
      },
      parameters: pathLevelParamsSpecs
    } = pathSpecs[endpoint];

    let transaction = {
      actual: {
        request: {
          body: getTestRequestBody(requestBody),
          headers: {
            'Content-Type': 'application/json'
          },
          method,
          path: endpoint
        },
        response: {}
      },
      expected: {
        method,
        responseBodySchema,
        statusCode: parseInt(statusCode, 10)
      },
      meta: {
        duration: undefined,
        endedAt: undefined,
        result: undefined,
        startedAt: new Date(startTime).toISOString()
      },
      operationId,
      skip: false
    };

    transaction =
      // eslint-disable-next-line no-await-in-loop
      (await triggerHook(hooksFilePath, 'beforeEach', transaction)) ||
      transaction;

    transaction.actual.request.resolvedPath = getResolvedTestEndpoint(
      transaction.actual.request.path,
      pathLevelParamsSpecs,
      operationLevelParamsSpecs
    );
    testMetaData.resolvedPath = transaction.actual.request.resolvedPath;

    if (transaction.skip) {
      logTestName(TEST_STATUS_SKIP, testMetaData);
      testsResults.skippedCount += 1;
      transaction.meta.testStatus = TEST_STATUS_SKIP;
    } else {
      const axiosConfig = getAxiosConfig(apiBaseUrl, transaction);

      let testResponseBody = {};
      let testResponseHeaders = {};
      let testResponseStatusCode;
      let connectionError;

      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await axios(axiosConfig);
        testResponseBody = result.data;
        testResponseHeaders = result.headers;
        testResponseStatusCode = result.status;
        transaction.actual.response.body = testResponseBody;
        transaction.actual.response.headers = testResponseHeaders;
        transaction.actual.response.statusCode = testResponseStatusCode;
      } catch (err) {
        switch (err.code) {
          case 'ECONNREFUSED':
            connectionError = err.message;
            break;

          default:
            testResponseBody = err && err.response && err.response.data;
            testResponseHeaders = err && err.response && err.response.headers;
            testResponseStatusCode = err && err.response && err.response.status;
            transaction.actual.response.body = testResponseBody;
            transaction.actual.response.headers = testResponseHeaders;
            transaction.actual.response.statusCode = testResponseStatusCode;
            break;
        }
      }

      const { errors: responseBodySchemaErrors, isValid: isValidResponseBody } =
        validateResponseBodySchema(responseBodySchema, testResponseBody);
      const {
        error: responseStatusCodeError,
        isValid: isValidResponseStatusCode
      } = validateResponseStatusCode(statusCode, testResponseStatusCode);

      const endTime = Date.now();
      testMetaData.duration = `${endTime - startTime} ms`;
      transaction.meta.endedAt = new Date(endTime).toISOString();
      transaction.meta.duration = testMetaData.duration;

      if (connectionError) {
        testsResults.failedCount += 1;

        logTestName(TEST_STATUS_FAIL, testMetaData);
        log.error(
          `       Error: Unable to reach API server - ${connectionError}`
        );

        transaction.meta.testStatus = TEST_STATUS_FAIL;
      } else if (responseStatusCodeError || !isValidResponseBody) {
        testsResults.failedCount += 1;

        logTestName(TEST_STATUS_FAIL, testMetaData);

        if (!isValidResponseStatusCode) {
          logEmptyLines();
          logFailedResponseStatusCodeAssertion(responseStatusCodeError);
        }

        if (!isValidResponseBody) {
          logEmptyLines();
          logFailedResponseBodyAssertion(
            responseBodySchemaErrors,
            testResponseBody
          );
        }

        transaction.meta.testStatus = TEST_STATUS_FAIL;
      } else {
        testsResults.passedCount += 1;
        logTestName(TEST_STATUS_PASS, testMetaData);

        transaction.meta.testStatus = TEST_STATUS_PASS;
      }
    }

    // eslint-disable-next-line no-await-in-loop
    await triggerHook(hooksFilePath, 'afterEach', transaction);
  }

  await triggerHook(hooksFilePath, 'afterAll');

  testsResults.duration = (Date.now() - testsResults.startTime) / 1000;
  logTestsResults(testsResults);

  if (testsResults.failedCount) {
    process.exit(1);
  }
};

module.exports = testOpenApiPaths;
