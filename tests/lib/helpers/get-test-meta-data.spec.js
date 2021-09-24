const chance = require('chance').Chance();
const {
  CONTENT_TYPE_APPLICATION_JSON
} = require('../../../lib/constants/http-content-types');
const getTestMetaData = require('../../../lib/helpers/get-test-meta-data');
const generateSpecName = require('../../__helpers/generate-spec-name');

describe(generateSpecName(), () => {
  let pathSpecs;
  let endpoint;
  let method;
  let contentType;
  let skip;
  let statusCode;
  let operationId;
  let summary;
  let excludedMethods;
  let excludedStatusCodes;
  let results;
  let expectedMetaData;

  beforeEach(() => {
    endpoint = `/${chance.string({
      alpha: true,
      casing: 'lower'
    })}`;
    method = 'get';
    contentType = CONTENT_TYPE_APPLICATION_JSON;
    skip = false;
    statusCode = chance.integer({
      max: 599,
      min: 200
    });
    operationId = chance.string({
      alpha: true,
      casing: 'lower'
    });
    summary = chance.sentence({ words: 3 });

    pathSpecs = {
      [endpoint]: {
        [method]: {
          operationId,
          requestBody: {
            content: {
              [contentType]: {}
            }
          },
          responses: {
            [statusCode]: {
              content: {
                [contentType]: {}
              }
            }
          },
          summary
        }
      }
    };
    excludedMethods = [];
    excludedStatusCodes = [];
    results = undefined;

    expectedMetaData = [
      {
        endpoint,
        method,
        operationId,
        requestBodyContentType: contentType,
        skip,
        statusCode: statusCode.toString(),
        summary
      }
    ];
  });

  it('should return an array of meta data that uniquely identify each test case to be generated', () => {
    results = getTestMetaData(pathSpecs, excludedMethods, excludedStatusCodes);

    expect(results).toStrictEqual(expectedMetaData);
  });

  it('should include meta data with skip set to true if the spec is in the excluded methods', () => {
    excludedMethods = [method];
    results = getTestMetaData(pathSpecs, excludedMethods, excludedStatusCodes);
    expectedMetaData[0].skip = true;

    expect(results).toStrictEqual(expectedMetaData);
  });

  it('should include meta data with skip set to true if the spec is in the excluded status codes', () => {
    excludedStatusCodes = [statusCode];
    results = getTestMetaData(pathSpecs, excludedMethods, excludedStatusCodes);
    expectedMetaData[0].skip = true;

    expect(results).toStrictEqual(expectedMetaData);
  });
});
