const chance = require('chance').Chance();
const {
  CONTENT_TYPE_APPLICATION_JSON
} = require('../../../lib/constants/http-content-types');
const getTestRequestBody = require('../../../lib/helpers/get-test-request-body');
const generateSpecName = require('../../__helpers/generate-spec-name');

describe(generateSpecName(), () => {
  let requestBodySpec;
  let result;
  let contentType;

  beforeEach(() => {
    contentType = CONTENT_TYPE_APPLICATION_JSON;
    requestBodySpec = {
      content: {
        [contentType]: {
          examples: {
            example1: {
              value: {
                bar: chance.string(),
                foo: chance.string()
              }
            },
            example2: {
              value: {
                bar: chance.string(),
                foo: chance.string()
              }
            }
          },
          schema: {
            properties: {
              bar: {
                type: 'string'
              },
              foo: {
                type: 'string'
              }
            }
          }
        }
      }
    };
    result = undefined;
  });

  it('should return the first example from the request body schema', () => {
    result = getTestRequestBody(requestBodySpec, contentType);
    const { value: expectedRequestBody } =
      requestBodySpec.content[contentType].examples.example1;

    expect(result).toStrictEqual(expectedRequestBody);
  });

  it('should generate an example from the schema if no request example exists', () => {
    requestBodySpec.content[contentType].examples = {};
    result = getTestRequestBody(requestBodySpec, contentType);

    expect(result).toStrictEqual(
      expect.objectContaining({
        bar: expect.any(String),
        foo: expect.any(String)
      })
    );
  });

  it('should return an empty object if no properties or examples are found', () => {
    requestBodySpec.content[contentType] = {};
    result = getTestRequestBody(requestBodySpec, contentType);

    expect(result).toStrictEqual({});
  });
});
