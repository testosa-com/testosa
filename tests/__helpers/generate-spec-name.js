const path = require('path');
const callsite = require('callsite');

const getCallsiteContext = (delta, systemFilePath) => {
  const siteDelta = Number.isInteger(delta) ? 3 + delta : 3;
  const site = callsite()[siteDelta];
  let fileName =
    typeof site.getFileName() === 'string' ? site.getFileName() : '';
  fileName = fileName.replace(systemFilePath, '');

  const functionName =
    typeof site.getFunctionName() === 'string'
      ? site.getFunctionName()
      : 'anonymous';

  return {
    fileName,
    functionName,
    lineNumber: site.getLineNumber()
  };
};

const generateSpecName = (context) => {
  const systemFilePath = path.join(__dirname, '../');
  const { fileName } = getCallsiteContext(-1, systemFilePath);
  const suffix = context ? ` - ${context}` : '';
  return `${fileName.replace('.spec', '')}${suffix}`;
};

module.exports = generateSpecName;
