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
			throw 'X and Y arrays (of the same size) are required';
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
