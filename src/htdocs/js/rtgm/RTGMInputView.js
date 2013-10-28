/* global define */

define([
	'mvc/View',
	'util/Util',
	'rtgm/Curve',
	'rtgm/HazardCurveParser'
], function (
	View,
	Util,
	Curve,
	HazardCurveParser
) {
	'use strict';

	var INPUT_VIEW_COUNTER = 0;
	var DEFAULTS = {

	};

	var RTGMInputView = function (options) {
		options = Util.extend({}, DEFAULTS, options);

		this._id_prefix = 'rtgm-input-view-' + (INPUT_VIEW_COUNTER++) + '-';

		View.call(this, options);
	};
	RTGMInputView.prototype = Object.create(View.prototype);

	/**
	 * Initialize view, and call render.
	 */
	RTGMInputView.prototype._initialize = function () {
		var titleId = this._id_prefix + 'title',
		    inputId = this._id_prefix + 'data',
		    computeId = this._id_prefix + 'compute';

		Util.addClass(this._el, 'rtgm-input-view');

		// build the view skeleton
		this._el.innerHTML = [
				'<label for="', titleId, '" class="rtgm-input-title">',
					'Curve Title',
				'</label>',
				'<input type="text" id="', titleId, '" class="rtgm-input-title"/>',
				'<label for="', inputId, '" class="rtgm-input-data">Curve Data</label>',
				'<textarea id="', inputId, '" class="rtgm-input-data"></textarea>',
				'<button id="', computeId, '">Compute RTGM</button>',
		].join('');

		this._title = this._el.querySelector('#' + titleId);
		this._input = this._el.querySelector('#' + inputId);
		this._compute = this._el.querySelector('#' + computeId);

		this._compute.addEventListener('click', (function (scope) {
			return function (evt) {
				scope.parseRequest(evt);
			};
		})(this));

		// render the view
		this.render();
	};

	RTGMInputView.prototype.parseRequest = function () {
		var data = this._input.value;
		try {
			this.trigger('hazardCurve', {title: this._title.value,
					curve: HazardCurveParser.parse(data)});
		} catch (ex) {
			this.trigger('hazardCurveError', data);
		}
	};

	return RTGMInputView;
});
