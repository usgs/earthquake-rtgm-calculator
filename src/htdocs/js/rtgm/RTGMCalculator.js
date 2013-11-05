/* global define */
define([
	'util/Events',
	'util/Util',
	'mvc/Model'
], function (
	Events,
	Util,
	Model
) {
	'use strict';

	var DEFAULT_BASE_URL = '/service';
	var JSON_CALLBACK_INCREMENT = 0;

	var __json_callback = function () {
		return [
			'rtgmcalculator',
			(new Date()).getTime(),
			JSON_CALLBACK_INCREMENT++
		].join('_');
	};

	var RTGMCalculator = function (baseUrl, parentNode) {
		Events.call(this);
		this._baseUrl = baseUrl || DEFAULT_BASE_URL;
		this._parentNode = parentNode ||
				document.querySelector('script').parentNode;
	};
	RTGMCalculator.prototype = Object.create(Events.prototype);

	RTGMCalculator.prototype.calculate = function (curve, title, xunits) {
		var _this = this,
		    script = document.createElement('script'),
		    uniqueCallback = __json_callback(),
		    onError, cleanup = null;
		
		onError = function () {
			_this.trigger('error', {status: null, error: 'Request Failed'});
			cleanup();
		};

		cleanup = function () {
			script.parentNode.removeChild(script);
			Util.removeEvent(script, 'error', onError);
			onError = null;
			cleanup = null;
			window[uniqueCallback] = null;
			delete window[uniqueCallback];
		};

		window[uniqueCallback] = function (data) {
			var attrs = null;
			if (data.status === 200) {
				attrs = Util.extend({}, data.rtgm, {
					title: title,
					xunits: xunits,
					id: (new Date()).getTime(),
					url: script.src.replace('/' + uniqueCallback, '')
				});
				_this.trigger('success', new Model(attrs));
			} else {
				_this.trigger('error', data);
			}
			cleanup();
		};

		script.async = 1;
		script.src = this._createScriptUrl(curve, uniqueCallback);
		Util.addEvent(script, 'error', onError);
		this._parentNode.appendChild(script);
	};

	RTGMCalculator.prototype._createScriptUrl = function (curve, callback) {
		var url = [
			this._baseUrl, '/',
			curve.get('xs').join(','), '/',
			curve.get('ys').join(','),
		];
		if (typeof callback === 'string') {
			url.push('/' + callback);
		}
		return url.join('');
	};

	return RTGMCalculator;
});
