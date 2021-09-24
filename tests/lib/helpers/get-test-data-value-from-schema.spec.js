const chance = require('chance').Chance();
const _ = require('lodash');
const getTestDataValueFromSchema = require('../../../lib/helpers/get-test-data-value-from-schema');
const generateSpecName = require('../../__helpers/generate-spec-name');

expect.extend({
  toBeAnInteger(received) {
    return {
      pass: _.isInteger(received)
    };
  }
});

describe(generateSpecName(), () => {
  let type;
  let dataProperties;
  let defaultValue;
  let exampleValue;
  let enumValues;
  let result;

  describe('provided fallbacks (defaultValue, exampleValue, enumValues[]', () => {
    beforeEach(() => {
      type = 'string';
      dataProperties = {};
      defaultValue = chance.string();
      exampleValue = chance.string();
      enumValues = [chance.string(), chance.string()];
      result = undefined;
    });

    it('should return the default value if provided', () => {
      result = getTestDataValueFromSchema(
        type,
        dataProperties,
        defaultValue,
        exampleValue,
        enumValues
      );

      expect(result).toStrictEqual(defaultValue);
    });

    it('should return the example value if default is undefined', () => {
      defaultValue = undefined;
      result = getTestDataValueFromSchema(
        type,
        dataProperties,
        defaultValue,
        exampleValue,
        enumValues
      );

      expect(result).toStrictEqual(exampleValue);
    });

    it('should return the first value in the enum array defaultValue and exampleValue are undefined', () => {
      defaultValue = undefined;
      exampleValue = undefined;
      result = getTestDataValueFromSchema(
        type,
        dataProperties,
        defaultValue,
        exampleValue,
        enumValues
      );

      expect(result).toStrictEqual(enumValues[0]);
    });
  });

  describe('values from type definitions (no provided fallbacks)', () => {
    beforeEach(() => {
      dataProperties = {};
      defaultValue = undefined;
      exampleValue = undefined;
      enumValues = undefined;
      result = undefined;
    });

    describe('type: boolean', () => {
      it('should return `true` or `false` when type is boolean', () => {
        type = 'boolean';
        result = getTestDataValueFromSchema(type);

        expect(result).toStrictEqual(expect.any(Boolean));
      });
    });

    describe('type: integer', () => {
      beforeEach(() => {
        type = 'integer';
      });

      it('should return a random integer', () => {
        result = getTestDataValueFromSchema(type);

        expect(result).toBeAnInteger();
      });
    });

    describe('type: number', () => {
      beforeEach(() => {
        type = 'number';
      });

      it('should return a random number', () => {
        result = getTestDataValueFromSchema(type);

        expect(result).toStrictEqual(expect.any(Number));
      });
    });

    describe('type: string', () => {
      beforeEach(() => {
        type = 'string';
      });

      it('should return a random string', () => {
        result = getTestDataValueFromSchema(type);

        expect(result).toStrictEqual(expect.any(String));
      });
    });

    describe('type: unknown', () => {
      it('should return undefined if type is unsupported', () => {
        type = 'unknown';
        result = getTestDataValueFromSchema(type);

        expect(result).toBeUndefined();
      });
    });
  });
});
