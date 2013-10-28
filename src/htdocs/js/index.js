require.config({
	baseUrl: 'js',
	paths: {
		'mvc': '/hazdev-webutils/src/mvc',
		'util': '/hazdev-webutils/src/util',
		'dygraph': '/dygraphs/dygraph-combined'
	},
	shim: {
		dygraph: {
			exports: 'Dygraph'
		}
	}
});

require([
	'rtgm/RTGMApplication',
	'FoxPlazaPreload'
], function (
	RTGMApplication,
	FoxPlazaPreload
) {
	'use strict';

	new RTGMApplication({
		el: document.querySelector('#application')
	});

	FoxPlazaPreload.load();
});
