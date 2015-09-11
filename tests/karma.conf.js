// Karma configuration
// Generated on Wed Sep 03 2014 13:49:54 GMT+1000 (EST)

module.exports = function(config) {
  var sauceLaunchers = {
    'Ie': {
      base: 'SauceLabs',
      browserName: 'internet explorer',
      platform: process.env.BVER === '10' ? 'Windows 8' : 'Windows 8.1',
      version: process.env.BVER
    }
  };
  var browser = process.env.BROWSER || 'chrome';
  var files = [
    'https://static.opentok.com/v2/js/opentok.js',
    '../opentok-layout.js',
    '**/*spec.js'
  ];

  if (process.env.JQUERY) {
    files.unshift('https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js');
  }

  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],

    files: files,

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      'opentok-layout.js': 'coverage'
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'coverage', 'saucelabs'],

    coverageReporter: {
      type : 'lcov',
      dir : '../coverage/'
    },

    customLaunchers: sauceLaunchers,

    sauceLabs: {
      startConnect: false,
      tunnelIdentifier: process.env.TRAVIS_JOB_NUMBER
    },

    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    browsers: [browser[0].toUpperCase() + browser.substr(1)],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  });
};
