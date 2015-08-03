'use strict';

var concurrent = {
  dev: [
    'browserify:index',
    'copy:dev',
    'copy:dygraph',
    'compass:dev'
  ],

  dist: [
    'copy:dist',
    'uglify',
    'cssmin'
  ],

  test: [
    'browserify:test',
    'browserify:bundle',
    'copy:test'
  ]
};

module.exports = concurrent;
