'use strict';

var config = require('./config');

var copy = {
  dev: {
    cwd: config.src,
    dest: config.build + '/' + config.src,
    expand: true,
    src: [
      '**/*',
      '!**/*.scss',
      '!**/*.js'
    ],
    filter: 'isFile',
    options: {
      mode: true
    }
  },

  dist: {
    cwd: config.build + '/' + config.src,
    dest: config.dist,
    expand: true,
    src: [
      'conf/config.inc.php',
      'conf/config.ini',

      'htdocs/css/images/**/*',
      'htdocs/images/**/*',
      'htdocs/js/dygraph-combined.js',
      'htdocs/*.html',
      'htdocs/*.php',

      'lib/**/*'
    ],
    filter: 'isFile',
    options: {
      mode: true
    }
  },

  test: {
    cwd: config.test,
    dest: config.build + '/' + config.test,
    expand: true,
    src: [
      'test.html'
    ]
  },

  dygraph: {
    cwd: 'node_modules/dygraphs',
    dest: config.build + '/' + config.src + '/htdocs/js',
    expand: true,
    src: [
      'dygraph-combined.js'
    ]
  }
};

module.exports = copy;
