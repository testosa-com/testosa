const getAxiosConfig = (apiBaseUrl, transaction) => {
  const {
    actual: {
      request: { body: data, headers, method, resolvedPath }
    }
  } = transaction;

  return {
    data,
    headers,
    method,
    url: `${apiBaseUrl}${resolvedPath}`
  };
};

module.exports = getAxiosConfig;
