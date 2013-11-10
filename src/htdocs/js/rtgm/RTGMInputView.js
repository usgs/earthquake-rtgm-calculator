/* global define */

define([
	'mvc/View',
	'util/Util',
	'rtgm/Curve'
], function (
	View,
	Util,
	Curve
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
		    saId = this._id_prefix + 'sa',
		    xunId = this._id_prefix + 'xun',
		    xunPct = this._id_prefix + 'xunPct',
		    afeId = this._id_prefix + 'afe',
		    computeId = this._id_prefix + 'compute';

		Util.addClass(this._el, 'rtgm-input-view');

		// build the view skeleton
		this._el.innerHTML = [
				'<label for="', titleId, '" class="rtgm-input-title">',
					'Curve Title',
				'</label>',
				'<input type="text" id="', titleId, '" class="rtgm-input-title" value=""/>',
				'<label for="', saId, '" class="rtgm-input-sa">',
					'Spectral Response Acceleration Values',
					'<span class="help">comma-separated x-values</span>',
				'</label>',
				'<input type="text" id="', saId, '" class="rtgm-input-sa" value=""/>',
		        '<label>',
					'Spectral Response Acceleration Units',
					'<span class="help">Select units for x-values</span>',
				'</label>',
				'<label for="', xunId, '" class="rtgminput-xun">',
			        '<input type="radio"  id="', xunId, '" class="rtgm-input-xun" checked="checked" name="xunits" value="g"/>',
			     'g</label>',
			      '<label for="', xunPct, '" class="rtgminput-xunPct">',
			        '<input type="radio"  id="', xunPct, '" class="rtgm-input-xunPct" name="xunits" value="%g"/>',
			      '%g</label>',
				'<label for="', afeId, '" class="rtgm-input-afe">',
					'Annual Frequency of Exceedance Values',
					'<span class="help">comma-separated y-values</span>',
				'</label>',
				'<input type="text" id="', afeId, '" class="rtgm-input-afe" value=""/>',
				'<button id="', computeId, '" class="rtgm-input-button">',
					'Compute RTGM',
				'</button>',
		].join('');

		this._title = this._el.querySelector('input.rtgm-input-title');
		this._sa = this._el.querySelector('input.rtgm-input-sa');
		this._xun = this._el.querySelector('input.rtgm-input-xun');
		this._xunPct = this._el.querySelector('input.rtgm-input-xunPct');
		this._afe = this._el.querySelector('input.rtgm-input-afe');
		this._compute = this._el.querySelector('button.rtgm-input-button');

		this._compute.addEventListener('click', (function (scope) {
			return function (evt) {
				scope.parseRequest(evt);
			};
		})(this));

		// render the view
		this.render();
	};

	RTGMInputView.prototype.parseRequest = function () {
		var title = this._title.value,
		    xunits = this._xun.value,
		    sa = this._sa.value.split(','),
		    afe = this._afe.value.split(','),
		    curve = null;

		if (this._xun.checked === true) {
			xunits = this._xun.value;
		} else {
			xunits = this._xunPct.value;
		}
		try {
			curve = new Curve({xs: sa, ys: afe });
		} catch (ex) {
			this.trigger('hazardCurveError', {title: title, sa: sa, afe: afe,
				ex: ex});
		}
		if (curve !== null) {
			this.trigger('hazardCurve', {title: title, curve: curve, xunits: xunits});
		}
	};
	return RTGMInputView;
});
