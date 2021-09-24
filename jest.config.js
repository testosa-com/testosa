const config = {
  collectCoverage: true,
  collectCoverageFrom: ['lib/**/*.js'],
  coveragePathIgnorePatterns: [
    'lib/constants/*.*',
    'lib/helpers/log.js',
    'lib/schemas/*.*',
    'lib/utils/log.js'
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  verbose: true
};

module.exports = config;
