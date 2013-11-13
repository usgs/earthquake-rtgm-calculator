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
		var i = null;
		// Check that array sizes are the same size
		if (!attributes || (attributes.xs.length !== attributes.ys.length)) {
			throw 'X and Y arrays (of the same size) are required.';
		}
		// Check if x and y arrays are less than 2 values
		if ((attributes.xs.length || attributes.ys.length) < 2){
			throw 'X and Y arrays require at least 2 values.';
		}
		//Check X and Y values for numerical values
		for (i = 0; i < attributes.ys.length; i++){
			if (isNaN(attributes.xs[i]) || isNaN(attributes.ys[i])){
				throw 'X and Y values must be numerical.';
			}
		}
		// Call parent constructor
		Model.call(this, Util.extend({}, DEFAULTS, attributes));
	};

	Curve.prototype = Object.create(Model.prototype);

	return Curve;

});
