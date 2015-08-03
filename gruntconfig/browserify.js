'use strict';

var config = require('./config');

var CWD,
    JS_SRC;

CWD = process.cwd();
JS_SRC = CWD + '/' + config.src + '/htdocs/js';

// List individual modules here. Each listed module will be aliased in the
// "bundle", and will be set as an external in the "test".
var EXPORTS = [
  JS_SRC + '/rtgm/Curve.js:rtgm/Curve',
  JS_SRC + '/rtgm/HazardCurveParser.js:rtgm/HazardCurveParser',
  JS_SRC + '/rtgm/RTGMApplication.js:rtgm/RTGMApplication',
  JS_SRC + '/rtgm/RTGMCalculator.js:rtgm/RTGMCalculator',
  JS_SRC + '/rtgm/RTGMGraphOutput.js:rtgm/RTGMGraphOutput',
  JS_SRC + '/rtgm/RTGMInputView.js:rtgm/RTGMInputView',
  JS_SRC + '/rtgm/RTGMListOutput.js:rtgm/RTGMListOutput'
];

var browerify = {
  options: {
    browserifyOptions: {
      debug: true,
      paths: [
        JS_SRC,
        CWD + '/node_modules/hazdev-webutils/src',
        CWD + '/node_modules/dygraphs'
      ]
    }
  },


  // the bundle used by the index page
  index: {
    src: [config.src + '/htdocs/js/index.js'],
    dest: config.build + '/' + config.src + '/htdocs/js/index.js'
  },

  // the bundle used by tests
  bundle: {
    src: [],
    dest: config.build + '/' + config.src + '/htdocs/js/bundle.js',
    options: {
      alias: EXPORTS
    }
  },

  // the bundle of test suites
  test: {
    src: [config.test + '/js/test.js'],
    dest: config.build + '/' + config.test + '/js/test.js',
    options: {
      external: EXPORTS
    }
  }
};

module.exports = browerify;
