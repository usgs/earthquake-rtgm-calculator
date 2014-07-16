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
	'APP_CONFIG',
	'FoxPlazaPreload'
], function (
	RTGMApplication,
	APP_CONFIG,
	FoxPlazaPreload
) {
	'use strict';

	new RTGMApplication({
		el: document.querySelector('#application'),
		baseUrl: APP_CONFIG.MOUNT_PATH
	});

	FoxPlazaPreload.load();
});
