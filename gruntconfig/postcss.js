'use strict';

var autoprefixer = require('autoprefixer'),
    cssImport = require('postcss-import'),
    cssnano = require('cssnano'),
    precss = require('precss');


var config = require('./config');

var postcss = {
  dev: {
    cwd: config.src + '/htdocs',
    dest: config.build + '/' + config.src + '/htdocs',
    expand: true,
    ext: '.css',
    extDot: 'last',
    options: {
      map: true,
      processors: [
        cssImport({
          path: [
            'node_modules/hazdev-webutils/src'
          ]
        }),
        precss(),
        autoprefixer({browsers: 'last 2 versions'})
      ]
    },
    src: [
      '**/*.scss',
      '!**/_*.scss'
    ]
  },

  dist: {
    cwd: config.build + '/' + config.src + '/htdocs',
    dest: config.dist + '/htdocs',
    expand: true,
    options: {
      processors: [
        cssnano()
      ],
    },
    src: [
      '**/*.css'
    ]
  }
};

module.exports = postcss;
