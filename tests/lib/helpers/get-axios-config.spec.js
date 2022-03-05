const chance = require('chance').Chance();
const _ = require('lodash');
const getAxiosConfig = require('../../../lib/helpers/get-axios-config');
const generateSpecName = require('../../__helpers/generate-spec-name');

// eslint-disable-next-line
expect.extend({
  objectOrNothing(received) {
    return {
      pass:
        _.isPlainObject(received) || received === undefined || received === null
    };
  }
});

describe(generateSpecName(), () => {
  let axiosConfig;
  const apiBaseUrl = chance.url({ domain: 'testosa.com' });
  const contentType = 'application/json';
  const transaction = {
    actual: {
      request: {
        body: undefined,
        headers: {
          'Content-Type': contentType
        },
        method: 'get',
        path: '/users'
      },
      response: {}
    },
    expected: {
      method: 'get',
      responseBodySchema: {},
      statusCode: chance.integer({
        max: 599,
        min: 200
      })
    },
    meta: {
      duration: undefined,
      endedAt: undefined,
      result: undefined,
      startedAt: new Date(new Date()).toISOString()
    },
    operationId: chance.string({ casing: 'lower' }),
    skip: false
  };

  beforeEach(() => {
    axiosConfig = getAxiosConfig(apiBaseUrl, transaction);
  });

  afterEach(() => {
    axiosConfig = undefined;
  });

  it('should return an axios config object from the apiBaseUrl and transaction parameters', () => {
    expect(axiosConfig).toStrictEqual(
      expect.objectContaining({
        data: expect.objectOrNothing(),
        headers: expect.objectOrNothing(),
        method: expect.any(String),
        url: expect.any(String)
      })
    );
  });
});
