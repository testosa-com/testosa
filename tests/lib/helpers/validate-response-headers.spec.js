const chance = require('chance').Chance();
const validateAjvSchema = require('../../../lib/helpers/validate-ajv-schema');
const validateResponseHeaders = require('../../../lib/helpers/validate-response-headers');
const generateSpecName = require('../../__helpers/generate-spec-name');

jest.mock('../../../lib/helpers/validate-ajv-schema');

describe(generateSpecName(), () => {
  let mockHeaderName;
  let responseHeadersSpecs;
  let headers;
  let result;

  beforeEach(() => {
    mockHeaderName = chance.string({
      alpha: true,
      casing: 'lower'
    });
    responseHeadersSpecs = {
      [mockHeaderName]: {
        schema: {
          type: 'string'
        }
      }
    };

    headers = {
      [mockHeaderName]: chance.string()
    };

    result = {
      errors: [],
      isValid: true
    };

    validateAjvSchema.mockImplementation(() => result);
  });

  it('should return valid if header(s) match the schema', () => {
    result = validateResponseHeaders(responseHeadersSpecs, headers);

    expect(result).toStrictEqual(result);
  });

  it('should return valid even if header(s) has different casing than schema', () => {
    headers = {
      [mockHeaderName.toUpperCase()]: chance.string()
    };
    result = validateResponseHeaders(responseHeadersSpecs, headers);

    expect(result).toStrictEqual(result);
  });

  it('should return invalid if header(s) do not match the schema', () => {
    result = {
      errors: [{ message: 'some error' }],
      isValid: false
    };
    validateAjvSchema.mockImplementation(() => result);
    result = validateResponseHeaders(responseHeadersSpecs, headers);

    expect(result).toStrictEqual(result);
  });
});
