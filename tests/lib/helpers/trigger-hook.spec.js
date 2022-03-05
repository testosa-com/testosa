const path = require('path');
const chance = require('chance').Chance();
const _ = require('lodash');
const {
  TEST_HOOK_AFTER_ALL,
  TEST_HOOK_AFTER_EACH,
  TEST_HOOK_BEFORE_ALL,
  TEST_HOOK_BEFORE_EACH
} = require('../../../lib/constants/test-hooks');
const triggerHook = require('../../../lib/helpers/trigger-hook');
const validateAjvSchema = require('../../../lib/helpers/validate-ajv-schema');
const log = require('../../../lib/utils/log');
const generateSpecName = require('../../__helpers/generate-spec-name');
const {
  afterAll: afterAllHook,
  afterEach: afterEachHook,
  beforeAll: beforeAllHook,
  beforeEach: beforeEachHook
} = require('../../__mocks/hooks-file');

jest.mock('../../__mocks/hooks-file');
jest.mock('../../../lib/helpers/validate-ajv-schema');

describe(generateSpecName(), () => {
  let hooksFilePath;
  let hookName;
  let prevTransaction;
  let updatedTransaction;
  let isFunctionSpy;
  let logErrorSpy;
  let logWarnSpy;

  beforeEach(() => {
    hooksFilePath = path.join(__dirname, '../../__mocks/hooks-file.js');
    hookName = 'beforeEach';
    prevTransaction = {
      actual: {
        request: {
          method: 'GET'
        }
      },
      skip: false
    };
    updatedTransaction = undefined;

    afterAllHook.mockImplementation(() => {});
    afterEachHook.mockImplementation(() => {});
    beforeAllHook.mockImplementation(() => {});
    beforeEachHook.mockImplementation(() => {});

    isFunctionSpy = jest.spyOn(_, 'isFunction').mockImplementation(() => true);

    logErrorSpy = jest.spyOn(log, 'error').mockImplementation(() => {});
    logWarnSpy = jest.spyOn(log, 'warn').mockImplementation(() => {});

    validateAjvSchema.mockImplementation(() => {
      return {
        errors: [],
        isValid: true
      };
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    isFunctionSpy.mockRestore();
    logErrorSpy.mockRestore();
    logWarnSpy.mockRestore();
  });

  describe('general', () => {
    it('should return the original transaction if the hooksFilePath is not provided', async () => {
      hooksFilePath = undefined;
      updatedTransaction = await triggerHook(
        hooksFilePath,
        hookName,
        prevTransaction
      );

      expect(isFunctionSpy).not.toHaveBeenCalled();
      expect(afterAllHook).not.toHaveBeenCalled();
      expect(afterEachHook).not.toHaveBeenCalled();
      expect(beforeAllHook).not.toHaveBeenCalled();
      expect(beforeEachHook).not.toHaveBeenCalled();
      expect(updatedTransaction).toStrictEqual(prevTransaction);
    });

    it('should return the original transaction if the hook name is not supported', async () => {
      hookName = chance.string();
      updatedTransaction = await triggerHook(
        hooksFilePath,
        hookName,
        prevTransaction
      );

      expect(isFunctionSpy).not.toHaveBeenCalled();
      expect(afterAllHook).not.toHaveBeenCalled();
      expect(afterEachHook).not.toHaveBeenCalled();
      expect(beforeAllHook).not.toHaveBeenCalled();
      expect(beforeEachHook).not.toHaveBeenCalled();
      expect(updatedTransaction).toStrictEqual(prevTransaction);
    });
  });

  describe(TEST_HOOK_BEFORE_EACH, () => {
    hookName = TEST_HOOK_BEFORE_EACH;

    it('should trigger the specified hook function', async () => {
      updatedTransaction = await triggerHook(
        hooksFilePath,
        hookName,
        prevTransaction
      );

      expect(isFunctionSpy).toHaveBeenCalledWith(expect.any(Function));
      expect(afterAllHook).not.toHaveBeenCalled();
      expect(afterEachHook).not.toHaveBeenCalled();
      expect(beforeAllHook).not.toHaveBeenCalled();
      expect(beforeEachHook).toHaveBeenCalledTimes(1);
      expect(updatedTransaction).toStrictEqual(prevTransaction);
    });

    it('should return an updated transaction if transaction.actual.request was modified', async () => {
      const result = {
        ...prevTransaction,
        actual: {
          request: {
            method: chance.string()
          }
        }
      };
      beforeEachHook.mockImplementation(() => result);
      updatedTransaction = await triggerHook(
        hooksFilePath,
        hookName,
        prevTransaction
      );

      expect(isFunctionSpy).toHaveBeenCalledWith(expect.any(Function));
      expect(afterAllHook).not.toHaveBeenCalled();
      expect(afterEachHook).not.toHaveBeenCalled();
      expect(beforeAllHook).not.toHaveBeenCalled();
      expect(beforeEachHook).toHaveBeenCalledTimes(1);
      expect(updatedTransaction).toStrictEqual(result);
    });

    it('should return an updated transaction if transaction.skip was modified', async () => {
      const result = {
        ...prevTransaction,
        skip: false
      };
      beforeEachHook.mockImplementation(() => result);
      updatedTransaction = await triggerHook(
        hooksFilePath,
        hookName,
        prevTransaction
      );

      expect(isFunctionSpy).toHaveBeenCalledWith(expect.any(Function));
      expect(afterAllHook).not.toHaveBeenCalled();
      expect(afterEachHook).not.toHaveBeenCalled();
      expect(beforeAllHook).not.toHaveBeenCalled();
      expect(beforeEachHook).toHaveBeenCalledTimes(1);
      expect(updatedTransaction).toStrictEqual(result);
    });

    it('should validate the modified transaction object', async () => {
      const result = {
        ...prevTransaction,
        skip: chance.string(),
        [chance.string()]: chance.string()
      };
      beforeEachHook.mockImplementation(() => result);
      validateAjvSchema.mockImplementation(() => {
        return {
          errors: [{}],
          isValid: false
        };
      });
      updatedTransaction = await triggerHook(
        hooksFilePath,
        hookName,
        prevTransaction
      );

      expect(isFunctionSpy).toHaveBeenCalledWith(expect.any(Function));
      expect(afterAllHook).not.toHaveBeenCalled();
      expect(afterEachHook).not.toHaveBeenCalled();
      expect(beforeAllHook).not.toHaveBeenCalled();
      expect(beforeEachHook).toHaveBeenCalledTimes(1);
      expect(validateAjvSchema).toHaveBeenLastCalledWith(
        expect.any(Object),
        expect.any(Object)
      );
      expect(logWarnSpy).toHaveBeenCalledWith(expect.any(String));
      expect(updatedTransaction).toStrictEqual(prevTransaction);
    });
  });

  describe(`${TEST_HOOK_AFTER_ALL}, ${TEST_HOOK_AFTER_EACH}, ${TEST_HOOK_BEFORE_ALL}`, () => {
    // eslint-disable-next-line
    [TEST_HOOK_AFTER_ALL, TEST_HOOK_AFTER_EACH, TEST_HOOK_BEFORE_ALL].forEach(
      (hook) => {
        it(`should return the original transaction if hook is '${hook}'`, async () => {
          const modifiedTransactionFromHook = {
            ...prevTransaction,
            actual: {
              request: {
                method: 'POST'
              }
            },
            skip: false
          };
          afterAllHook.mockImplementation(() => modifiedTransactionFromHook);
          afterEachHook.mockImplementation(() => modifiedTransactionFromHook);
          beforeAllHook.mockImplementation(() => modifiedTransactionFromHook);
          updatedTransaction = await triggerHook(
            hooksFilePath,
            hook,
            prevTransaction
          );
          expect(logWarnSpy).toHaveBeenCalledWith(expect.any(String));
          expect(updatedTransaction).toStrictEqual(prevTransaction);
        });
      }
    );
  });
});
