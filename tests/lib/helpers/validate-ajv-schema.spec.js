const chance = require('chance').Chance();
const validateAjvSchema = require('../../../lib/helpers/validate-ajv-schema');
const generateSpecName = require('../../__helpers/generate-spec-name');

describe(generateSpecName(), () => {
  let schema;
  let result;

  beforeEach(() => {
    schema = {
      additionalProperties: false,
      properties: {
        bar: {
          type: 'boolean'
        },
        foo: {
          type: 'string'
        }
      },
      require: ['foo', 'bar'],
      type: 'object'
    };
    result = undefined;
  });

  it('should return valid state with no errors', () => {
    const validData = {
      bar: chance.bool(),
      foo: chance.string()
    };
    result = validateAjvSchema(schema, validData);

    expect(result).toStrictEqual(
      expect.objectContaining({
        errors: null,
        isValid: true
      })
    );
  });

  it('should return an invalid state with an array of errors', () => {
    const invalidData = {
      bar: chance.integer()
    };
    result = validateAjvSchema(schema, invalidData);

    expect(result).toStrictEqual(
      expect.objectContaining({
        errors: expect.any(Array),
        isValid: false
      })
    );
  });

  // eslint-disable-next-line
  [
    {
      format: 'date-time',
      value: new Date().toISOString()
    },
    {
      format: 'email',
      value: chance.email()
    },
    {
      format: 'uuid',
      value: chance.guid()
    }
  ].forEach(({ format, value }) => {
    it(`should return valid even for additional format: ${format}`, () => {
      schema.properties.mockField = {
        format,
        type: 'string'
      };
      const validData = { mockField: value };
      result = validateAjvSchema(schema, validData);

      expect(result).toStrictEqual(
        expect.objectContaining({
          errors: null,
          isValid: true
        })
      );
    });

    it(`should return invalid bad data matching additional format: ${format}`, () => {
      schema.properties.mockField = {
        format,
        type: 'string'
      };
      const invalidData = { mockField: chance.string() };
      result = validateAjvSchema(schema, invalidData);

      expect(result).toStrictEqual(
        expect.objectContaining({
          errors: expect.any(Array),
          isValid: false
        })
      );
    });
  });
});
