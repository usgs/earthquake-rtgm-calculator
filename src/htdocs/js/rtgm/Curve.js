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

	var Curve = function(attributes) {

		// check the array sizes
	    if (!attributes || (attributes.xs.length !== attributes.ys.length)) {
			throw 'X and Y arrays (of the same size) are required';
		}
		
		// Call parent constructor
		Model.call(this, Util.extend({}, DEFAULTS, attributes));

	};

	Curve.prototype = Object.create(Model.prototype);

	return Curve;

});
