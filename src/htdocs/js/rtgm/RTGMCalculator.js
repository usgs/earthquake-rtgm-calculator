/* global define */
define([
], function (
) {
	'use strict';

	var JSON_CALLBACK_INCREMENT = 0;

	var __json_callback = function () {
		return [
			'rtgmcalculator',
			(new Date()).getTime(),
			JSON_CALLBACK_INCREMENT++
		].join('_');
	};

	var RTGMCalculator = function (baseUrl, insertAt) {

	};

	RTGMCalculator.prototype.calculate = function (curve, successCallback,
			errorCallback) {
		var script = document.createElement('script'),
		    uniqueCallback = __json_callback(),
		    onSucecss = null, onError = null, cleanup = null;

		script.async = 1;
		script.src = this._createScriptUrl(curve, uniqueCallback);


		window[uniqueCallback] = function (data) {
			onSuccess(data);
		};

		onSuccess = function (data) {
			cleanup();
			successCallback(data);
		};

		onError = function () {

		}
	};

	RTGMCalculator.prototype._createScriptUrl = function (curve, callback) {
		return [

		]
	};

	return RTGMCalculator;
});
