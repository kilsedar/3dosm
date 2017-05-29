module.exports = function(config) {
  config.set({

    basePath: '.',

    frameworks: ['jasmine', 'requirejs'],

    files: [
      'test-main.js',
      {pattern: 'test/*.js', included: false},
      {pattern: 'src/*.js', included: false},
    ],

    exclude: [
    ],

    preprocessors: {
    },

    reporters: ['progress'],

    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['Chrome', 'PhantomJS'],

    singleRun: false,

    concurrency: Infinity
  })
};
