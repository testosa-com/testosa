const supportedMethods = [
  'delete',
  'DELETE',
  'get',
  'GET',
  'options',
  'OPTIONS',
  'patch',
  'PATCH',
  'post',
  'POST',
  'put',
  'PUT',
  'trace',
  'TRACE'
];

const schema = {
  additionalProperties: {
    errorMessage:
      // eslint-disable-next-line no-template-curly-in-string
      'Unexpected field: ${0#} in transaction.actual.request object',
    not: true
  },
  properties: {
    body: {},
    headers: {
      properties: {
        'Content-Type': {
          type: 'string'
        }
      },
      type: 'object'
    },
    method: {
      enum: supportedMethods,
      type: 'string'
    },
    path: {
      type: 'string'
    }
  },
  required: ['headers', 'method', 'path'],
  type: 'object'
};

module.exports = schema;
