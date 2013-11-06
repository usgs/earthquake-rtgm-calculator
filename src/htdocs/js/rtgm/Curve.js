/*global define*/

define([
	'mvc/Model',
	'util/Util'
], function (Model, Util) {
	'use strict';

	var DEFAULTS = {
		'xs': [],
		'ys': []
	};

	var Curve = function (attributes) {
		var i = null, len = null;
		// check the array sizes
		if (!attributes || (attributes.xs.length !== attributes.ys.length)) {
			throw 'X and Y arrays (of the same size) are required.';
		}
		// check if x and y arrays are less than 2 values
		if ((attributes.xs.length || attributes.ys.length) < 2){
			throw 'X and Y arrays require at least 2 values.';
		}
		//Check X and Y values for values after each
		for (i = 0; i < attributes.ys.length; i++){
			if (attributes.xs[i] === ''){
				throw 'X values require a numerical value after earch comma.';
			}
			if (attributes.ys[i] === ''){
				throw 'Y values require a numerical value after each comma.';
			}
		}
		for (i = 0, len = attributes.xs.length; i < len; i++) {
			attributes.xs[i] = parseFloat(attributes.xs[i]);
			attributes.ys[i] = parseFloat(attributes.ys[i]);
		}
		// Call parent constructor
		Model.call(this, Util.extend({}, DEFAULTS, attributes));
	};

	Curve.prototype = Object.create(Model.prototype);

	return Curve;

});
