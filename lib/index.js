const axios = require('axios');
const chalk = require('chalk');
const _ = require('lodash');
const {
  TEST_HOOK_AFTER_ALL,
  TEST_HOOK_AFTER_EACH,
  TEST_HOOK_BEFORE_ALL,
  TEST_HOOK_BEFORE_EACH
} = require('./constants/test-hooks');
const {
  TEST_STATUS_FAIL,
  TEST_STATUS_PASS,
  TEST_STATUS_SKIP
} = require('./constants/test-statues');
const checkApiAccessibility = require('./helpers/check-api-accessibility');
const getAxiosConfig = require('./helpers/get-axios-config');
const getOpenApiSpec = require('./helpers/get-open-api-spec');
const getResolvedTestEndpoint = require('./helpers/get-resolved-test-endpoint');
const getTestsMetaData = require('./helpers/get-test-meta-data');
const getTestRequestBody = require('./helpers/get-test-request-body');
const getTestRequestHeaders = require('./helpers/get-test-request-headers');
const getTestosaConfig = require('./helpers/get-testosa-config');
const {
  logEmptyLines,
  logFailedResponsePropertiesAssertion,
  logFailedResponseStatusCodeAssertion,
  logTestName,
  logTestsResults,
  logTestSuiteName
} = require('./helpers/log');
const triggerHook = require('./helpers/trigger-hook');
const validateAjvSchema = require('./helpers/validate-ajv-schema');
const validateResponseHeaders = require('./helpers/validate-response-headers');
const validateResponseStatusCode = require('./helpers/validate-response-status-code');
const log = require('./utils/log');

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

  const totalStartTime = Date.now();
  const testsResults = {
    hasFailure: false,
    specs: {},
    totalCount: testsMetaData.length,
    totalDuration: undefined
  };

  await triggerHook(hooksFilePath, TEST_HOOK_BEFORE_ALL);

  for (let i = 0; i < testsMetaData.length; i++) {
    const testMetaData = testsMetaData[i];
    const {
      endpoint,
      method,
      operationId,
      requestBodyContentType,
      skip,
      statusCode,
      summary
    } = testMetaData;
    const specStartTime = Date.now();
    testsResults.specs[endpoint] = testsResults.specs[endpoint] || {
      failedCount: 0,
      passedCount: 0,
      skippedCount: 0,
      specStartTime
    };

    const { endpoint: prevEndpoint, method: prevMethod } =
      testsMetaData[i - 1] || {};

    const isNextTestSuite = endpoint !== prevEndpoint || method !== prevMethod;

    if (isNextTestSuite) {
      testsResults.specs[endpoint].startTime = Date.now();
      logTestSuiteName(method, summary, endpoint);
    }

    const {
      [method]: {
        requestBody: requestBodySpec = {},
        responses: responsesSpec,
        parameters: operationLevelParamsSpecs
      } = {},
      parameters: pathLevelParamsSpecs
    } = pathSpecs[endpoint] || {};

    const responseContentSpec =
      _.get(responsesSpec, `${statusCode}.content`) || {};

    const responseHeadersSpec =
      _.get(responsesSpec, `${statusCode}.headers`) || {};
    const responseBodyContentType = !_.isEmpty(
      responseContentSpec[requestBodyContentType]
    )
      ? requestBodyContentType
      : Object.keys(responseContentSpec)[0];
    const { schema: responseBodySchema = {} } =
      responseContentSpec[requestBodyContentType] || {};

    let transaction = {
      actual: {
        request: {
          body: getTestRequestBody(requestBodySpec, requestBodyContentType),
          headers: getTestRequestHeaders(
            operationLevelParamsSpecs,
            requestBodyContentType
          ),
          method,
          path: endpoint
        },
        response: {}
      },
      expected: {
        method,
        requestBodyContentType,
        responseBodyContentType,
        statusCode: parseInt(statusCode, 10)
      },
      meta: {
        duration: undefined,
        endedAt: undefined,
        result: undefined,
        startedAt: new Date(specStartTime).toISOString()
      },
      operationId,
      skip
    };

    transaction =
      // eslint-disable-next-line no-await-in-loop
      (await triggerHook(hooksFilePath, TEST_HOOK_BEFORE_EACH, transaction)) ||
      transaction;

    transaction.actual.request.resolvedPath = getResolvedTestEndpoint(
      transaction.actual.request.path,
      pathLevelParamsSpecs,
      operationLevelParamsSpecs
    );
    testMetaData.resolvedPath = transaction.actual.request.resolvedPath;

    if (transaction.skip) {
      logTestName(TEST_STATUS_SKIP, testMetaData);
      testsResults.specs[endpoint].skippedCount += 1;
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
        validateAjvSchema(
          responseBodySchema,
          testResponseBody,
          responseBodyContentType
        );
      const { errors: responseHeadersErrors, isValid: isValidResponseHeaders } =
        validateResponseHeaders(responseHeadersSpec, testResponseHeaders);
      const {
        error: responseStatusCodeError,
        isValid: isValidResponseStatusCode
      } = validateResponseStatusCode(statusCode, testResponseStatusCode);

      const endTime = Date.now();
      testMetaData.duration = `${endTime - specStartTime} ms`;
      transaction.meta.endedAt = new Date(endTime).toISOString();
      transaction.meta.duration = testMetaData.duration;

      if (connectionError) {
        testsResults.hasFailure = true;
        testsResults.specs[endpoint].failedCount += 1;

        logTestName(TEST_STATUS_FAIL, testMetaData);
        log.error(
          `       Error: Unable to reach API server - ${connectionError}`
        );

        transaction.meta.testStatus = TEST_STATUS_FAIL;
      } else if (
        responseStatusCodeError ||
        !isValidResponseHeaders ||
        !isValidResponseBody
      ) {
        logTestName(TEST_STATUS_FAIL, testMetaData);
        log.info(chalk.dim('    ┌'));

        if (!isValidResponseStatusCode) {
          logFailedResponseStatusCodeAssertion(responseStatusCodeError);
        }

        if (!isValidResponseHeaders) {
          if (!isValidResponseStatusCode) {
            log.info(chalk.dim('    │'));
          }

          logFailedResponsePropertiesAssertion(
            responseHeadersErrors,
            testResponseHeaders,
            'headers'
          );
        }

        if (!isValidResponseBody) {
          if (!isValidResponseHeaders || !isValidResponseStatusCode) {
            log.info(chalk.dim('    │'));
          }

          logFailedResponsePropertiesAssertion(
            responseBodySchemaErrors,
            testResponseBody,
            'body'
          );
        }

        log.info(chalk.dim('    └'));
        logEmptyLines();

        transaction.meta.testStatus = TEST_STATUS_FAIL;
        testsResults.hasFailure = true;
        testsResults.specs[endpoint].failedCount += 1;
      } else {
        testsResults.specs[endpoint].passedCount += 1;
        logTestName(TEST_STATUS_PASS, testMetaData);

        transaction.meta.testStatus = TEST_STATUS_PASS;
      }
    }

    // eslint-disable-next-line no-await-in-loop
    await triggerHook(hooksFilePath, TEST_HOOK_AFTER_EACH, transaction);

    if (i !== testsMetaData.length - 1) {
      const { endpoint: nextEndpoint, method: nextMethod } =
        testsMetaData[i + 1];

      if (nextEndpoint !== endpoint || nextMethod !== method) {
        testsResults.specs[endpoint].duration =
          Date.now() - testsResults.specs[endpoint].startTime;
      }
    } else {
      testsResults.specs[endpoint].duration =
        Date.now() - testsResults.specs[endpoint].startTime;
    }
  }

  await triggerHook(hooksFilePath, TEST_HOOK_AFTER_ALL);

  testsResults.totalDuration = Date.now() - totalStartTime;

  logTestsResults(testsResults);

  if (testsResults.hasFailure) {
    process.exit(1);
  }
};

module.exports = testOpenApiPaths;
