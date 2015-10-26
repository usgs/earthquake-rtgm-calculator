'use strict';

var concurrent = {
  dev: [
    'browserify:index',
    'copy:dev',
    'copy:dygraph',
    'postcss:dev'
  ],

  dist: [
    'copy:dist',
    'uglify',
    'postcss:dist'
  ],

  test: [
    'browserify:test',
    'browserify:bundle',
    'copy:test'
  ]
};

module.exports = concurrent;
