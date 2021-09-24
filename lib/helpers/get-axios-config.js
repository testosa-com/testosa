const Url = require('url');
const FormData = require('form-data');
const js2XmlParser = require('js2xmlparser');
const _ = require('lodash');
const {
  CONTENT_TYPE_APPLICATION_JSON,
  CONTENT_TYPE_APPLICATION_XML,
  CONTENT_TYPE_MULTIPART_FORM_DATA,
  CONTENT_TYPE_TEXT_PLAIN,
  CONTENT_TYPE_X_WWW_FORM_URLENCODED
} = require('../constants/http-content-types');

const getAxiosConfig = (apiBaseUrl, transaction) => {
  const {
    actual: {
      request: { body, headers, method, resolvedPath }
    }
  } = transaction;
  const contentType = headers['Content-Type'];
  let updatedHeaders = _.cloneDeep(headers);
  let data;

  switch (true) {
    case contentType.startsWith(CONTENT_TYPE_APPLICATION_JSON):
    case contentType.startsWith(CONTENT_TYPE_TEXT_PLAIN):
      data = body;
      break;

    case contentType.startsWith(CONTENT_TYPE_APPLICATION_XML):
      data = js2XmlParser.parse('Request', body);
      break;

    case contentType.startsWith(CONTENT_TYPE_MULTIPART_FORM_DATA):
      const formData = new FormData();
      _.forEach(body, (value, key) => {
        formData.append(key, value);
      });

      updatedHeaders = {
        ...updatedHeaders,
        ...formData.getHeaders()['content-type'],
        'Content-Type': formData.getHeaders()['content-type']
      };
      delete updatedHeaders['content-type'];
      break;

    case contentType.startsWith(CONTENT_TYPE_X_WWW_FORM_URLENCODED):
      const params = new Url.URLSearchParams(body);
      data = params.toString();
      break;

    default:
      break;
  }

  return {
    data,
    headers: updatedHeaders,
    method,
    url: `${apiBaseUrl}${resolvedPath}`
  };
};

module.exports = getAxiosConfig;
