/*global define*/
define([
	'mvc/View',
	'util/Events',
	'util/Util',
	'rtgm/Curve',
	'rtgm/HazardCurveParser'
], function (
	View,
	Events,
	Util,
	Curve,
	HazardCurveParser
) {

	'use strict';

	var _inputArea = null;

	/**
	 * Construct a new view
	 *
	 * @param option {Object}
	 *        view options.
	 * @param option.baselineCalculator {geomag.ObservationBaselineCalculator}
	 *        the calculator to use.
	 * @param option.reading {geomag.Reading}
	 *        the reading to display.
	 */
	var RTGMInputView = function (options) {
		options = Util.extend({}, {}, options);
		View.call(this, options);
	};

	RTGMInputView.prototype = Object.create(View.prototype);

	/**
	 * Initialize view, and call render.
	 * @param options {Object} same as constructor.
	 */
	RTGMInputView.prototype._initialize = function (options) {
		this._options = options;

		// build the view skeleton
		this._el.innerHTML = [
				'<h2>Hazard Curve Entry Form</h2>',
				'<p>Enter a hazard curve in the text area below.  Format can ' +
						'be two rows with the first containing X values ' +
						'and the second containing matching Y values OR ' +
						'multiple rows with two columns each (the first ' +
						'column containing the X value and the second column ' +
						'containing the matching Y value. Any characater can ' +
						'be used to delimit values on the same line with the ' +
						'exception of spaces, letters, numbers, decimal' + 
						'points or plus/minus signs.</p>',
				'<form onsubmit="return false;">',
					'<textarea id="inputArea" rows="15"></textarea><br/><br/>',
					'<div class="buttonHolder">',
						'<input type="submit" value="Compute" id="compute"/>',
					'</div>',
				'</form>'
		].join('');

		this._computeButton = this._el.querySelector('#compute');
		this._inputArea = _inputArea = this._el.querySelector('#inputArea');
		this._computeButton.addEventListener('click', this.parseRequest);

		// render the view
		this.render();
	};

	/**
	 * Nothing special to do here, currently.
	*/
	RTGMInputView.prototype.render = function () {
	};

	RTGMInputView.prototype.parseRequest = function (evt) {
		var inputString = {
			'inputString': _inputArea.value
		};
		try {
			this._curve = HazardCurveParser.parse(inputString);
			console.log('Parse successful.');
//		Trigger onHazardCurve success event here
		}
		catch (ex) {
			this._curve = null;
			console.log(ex);
//		Trigger error event here
		}
	};

	// return the constructor
	return RTGMInputView;

});
