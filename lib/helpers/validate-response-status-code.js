const validateResponseStatusCode = (expectedStatusCode, actualStatusCode) => {
  const isValid =
    parseInt(expectedStatusCode, 10) === parseInt(actualStatusCode, 10);

  let error;
  if (!isValid) {
    error = {
      actual: actualStatusCode,
      expected: expectedStatusCode
    };
  }

  return {
    error,
    isValid
  };
};

module.exports = validateResponseStatusCode;
