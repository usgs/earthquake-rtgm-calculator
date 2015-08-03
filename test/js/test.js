/* global mocha */
// require.config({
// 	baseUrl: '..',
// 	paths: {
// 		mocha: 'mocha/mocha',
// 		chai: 'chai/chai',
// 		sinon: 'sinon/pkg/sinon',
// 		mvc: '/hazdev-webutils/src/mvc',
// 		util: '/hazdev-webutils/src/util',
// 		dygraph: '/dygraphs/dygraph-combined'
// 	},
// 	shim: {
// 		mocha: {
// 			exports: 'mocha'
// 		},
// 		chai: {
// 			deps: ['mocha'],
// 			exports: 'chai'
// 		},
// 		sinon: {
// 			exports: 'sinon'
// 		},
// 		dygraph: {
// 			exports: 'Dygraph'
// 		}
// 	}
// });

// require([
// 	'mocha',
// ], function (
// 	mocha
// ) {
'use strict';

mocha.setup('bdd');

// Add each test class here as they are implemented
require('./spec/RTGMApplicationTest');
require('./spec/CurveTest');
require('./spec/HazardCurveParserTest');
require('./spec/RTGMInputViewTest');
require('./spec/RTGMCalculatorTest');
require('./spec/RTGMListOutputTest');

if (window.mochaPhantomJS) {
  window.mochaPhantomJS.run();
} else {
  mocha.run();
}
