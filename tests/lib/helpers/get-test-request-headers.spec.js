const chance = require('chance').Chance();
const {
  CONTENT_TYPE_APPLICATION_JSON
} = require('../../../lib/constants/http-content-types');
const getTestRequestHeaders = require('../../../lib/helpers/get-test-request-headers');
const generateSpecName = require('../../__helpers/generate-spec-name');

describe(generateSpecName(), () => {
  let operationLevelParams;
  let result;
  let contentType;

  beforeEach(() => {
    contentType = CONTENT_TYPE_APPLICATION_JSON;
    operationLevelParams = [
      {
        in: 'header',
        name: chance.string(),
        schema: {
          example: chance.string()
        }
      }
    ];
    result = undefined;
  });

  it('should return the first example from the request body schema', () => {
    result = getTestRequestHeaders(operationLevelParams);
    const {
      name,
      schema: { example }
    } = operationLevelParams[0];

    expect(result).toStrictEqual({ [name]: example });
  });

  it('should generate an example from the schema if no request example exists', () => {
    const { name } = operationLevelParams[0];
    result = getTestRequestHeaders(operationLevelParams, contentType);

    expect(result).toStrictEqual(
      expect.objectContaining({
        [name]: expect.any(String)
      })
    );
  });

  it('should return an empty object if no properties or examples are found', () => {
    operationLevelParams = [];
    result = getTestRequestHeaders(operationLevelParams);

    expect(result).toStrictEqual({});
  });

  it('should include an object with Content-Type if one is passed in', () => {
    const {
      name,
      schema: { example }
    } = operationLevelParams[0];
    result = getTestRequestHeaders(operationLevelParams, contentType);

    expect(result).toStrictEqual({
      'Content-Type': contentType,
      [name]: example
    });
  });

  it('should include a serialized set of cookies if cookie params are identified', () => {
    operationLevelParams = [
      {
        in: 'cookie',
        name: chance.string(),
        schema: {
          example: chance.string()
        }
      },
      {
        in: 'cookie',
        name: chance.string(),
        schema: {
          example: chance.string()
        }
      }
    ];
    const {
      name: cookieName0,
      schema: { example: cookieExample0 }
    } = operationLevelParams[0];
    const {
      name: cookieName1,
      schema: { example: cookieExample1 }
    } = operationLevelParams[1];
    const cookieStr = `${cookieName0}=${cookieExample0}; ${cookieName1}=${cookieExample1}`;
    result = getTestRequestHeaders(operationLevelParams);

    expect(result).toStrictEqual({ Cookie: cookieStr });
  });
});
