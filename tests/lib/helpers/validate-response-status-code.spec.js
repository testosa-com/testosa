const chance = require('chance').Chance();
const validateResponseStatusCode = require('../../../lib/helpers/validate-response-status-code');
const generateSpecName = require('../../__helpers/generate-spec-name');

describe(generateSpecName(), () => {
  let expectedStatusCode;
  let actualStatusCode;
  let result;

  beforeEach(() => {
    expectedStatusCode = chance.integer({
      max: 599,
      min: 200
    });
    actualStatusCode = chance.integer({
      max: 599,
      min: 200
    });
    result = undefined;
  });

  it('should return valid and no error if status codes match', () => {
    actualStatusCode = expectedStatusCode;
    result = validateResponseStatusCode(expectedStatusCode, actualStatusCode);

    expect(result).toStrictEqual(
      expect.objectContaining({
        error: undefined,
        isValid: true
      })
    );
  });

  it('should parse then compare integers from provided fn params', () => {
    actualStatusCode = expectedStatusCode.toString();
    result = validateResponseStatusCode(expectedStatusCode, actualStatusCode);

    expect(result).toStrictEqual(
      expect.objectContaining({
        error: undefined,
        isValid: true
      })
    );
  });

  it('should return invalid with error if status codes do not match', () => {
    result = validateResponseStatusCode(expectedStatusCode, actualStatusCode);

    expect(result).toStrictEqual(
      expect.objectContaining({
        error: {
          actual: actualStatusCode,
          expected: expectedStatusCode
        },
        isValid: false
      })
    );
  });
});
