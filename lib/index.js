const fs = require('fs');
const axios = require('axios');
const jsonSchemaRefParser = require('json-schema-ref-parser');
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
    request: { body: data, headers, method, resolvedPath }
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
    const { [hookName]: hook } = require(resolvedFilePath);

    if (_.isFunction(hook)) {
      updatedTransaction = await hook(transaction);
    }
  }

  return updatedTransaction;
};

const getOpenApiSpec = async (openapiFilePath) => {
  let resolveOpenApiSpec;

  try {
    const openapiSpecRaw = fs.readFileSync(openapiFilePath);
    const openapiSpec = JSON.parse(openapiSpecRaw);

    resolveOpenApiSpec = await jsonSchemaRefParser.dereference(openapiSpec);
  } catch (error) {
    logErrorAndTerminate(error);
  }

  return resolveOpenApiSpec;
};

const testOpenApiPaths = async (cliOptions) => {
  const {
    apiBaseUrl,
    apiServerStartupTimeout,
    excludedMethods,
    excludedStatusCodes,
    hooksFilePath,
    openapiFilePath
  } = getTestosaConfig(cliOptions);

  await checkApiAccessibility(apiBaseUrl, apiServerStartupTimeout);

  const { paths: pathSpecs } = await getOpenApiSpec(openapiFilePath);
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
      expected: {
        statusCode: parseInt(statusCode, 10)
      },
      operationId,
      request: {
        body: getTestRequestBody(requestBody),
        headers: {
          'Content-Type': 'application/json'
        },
        method,
        path: endpoint
      }
    };

    transaction =
      // eslint-disable-next-line no-await-in-loop
      (await triggerHook(hooksFilePath, 'beforeEach', transaction)) ||
      transaction;

    transaction.request.resolvedPath = getResolvedTestEndpoint(
      transaction.request.path,
      pathLevelParamsSpecs,
      operationLevelParamsSpecs
    );
    testMetaData.resolvedPath = transaction.request.resolvedPath;

    if (transaction.skip) {
      logTestName(TEST_STATUS_SKIP, testMetaData);
      testsResults.skippedCount += 1;
    } else {
      const axiosConfig = getAxiosConfig(apiBaseUrl, transaction);

      let testResponseBody = {};
      let testResponseStatusCode;
      let connectionError;

      try {
        // eslint-disable-next-line no-await-in-loop
        const result = await axios(axiosConfig);
        testResponseBody = result.data;
        testResponseStatusCode = result.status;
      } catch (err) {
        switch (err.code) {
          case 'ECONNREFUSED':
            connectionError = err.message;
            break;

          default:
            testResponseBody = err && err.response && err.response.data;
            testResponseStatusCode = err && err.response && err.response.status;
            break;
        }
      }

      const { errors: responseBodySchemaErrors, isValid: isValidResponseBody } =
        validateResponseBodySchema(responseBodySchema, testResponseBody);
      const {
        error: responseStatusCodeError,
        isValid: isValidResponseStatusCode
      } = validateResponseStatusCode(statusCode, testResponseStatusCode);

      testMetaData.duration = Date.now() - startTime;

      if (connectionError) {
        testsResults.failedCount += 1;

        logTestName(TEST_STATUS_FAIL, testMetaData);
        log.error(
          `       Error: Unable to reach API server - ${connectionError}`
        );
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
      } else {
        testsResults.passedCount += 1;
        logTestName(TEST_STATUS_PASS, testMetaData);
      }
    }
  }

  testsResults.duration = (Date.now() - testsResults.startTime) / 1000;
  logTestsResults(testsResults);

  if (testsResults.failedCount) {
    process.exit(1);
  }
};

module.exports = testOpenApiPaths;
