/*global define*/

define([
	'rtgm/Curve',
	'mvc/Model',
	'util/Util'
], function (Curve, Model, Util) {
	'use strict';

	var DEFAULTS = {
		'inputString': null
	};

	var HazardCurveParser = function(attributes) {

		// Call parent constructor
		Model.call(this, Util.extend({}, DEFAULTS, attributes));
	};

	HazardCurveParser.prototype = Object.create(Model.prototype);

	/**
	 * Parses the input string into a curve object containing the appropriate
	 * X and Y arrays.  Allows for two types of formats:
	 *
	 * 1. A line of delimited X values, followed by a line of matching
	 * delimited Y values.
	 *
	 * 2. Any number of lines of delimited (X, Y) coordinate pairs.
	 *
	 * Will attempt to use any single non-alphanumeric character (except
	 * spaces or cr/lf) as a delimiter but the character used must be 
	 * consistent (ie. the first one found is THE delimiter).
	 *
	 * @return {Curve} the curve object containing the parsed data.
	 *
	 * @throws an excpetion if the input can not be parsed.
	 * 
	 */
	HazardCurveParser.prototype.parse = function () {
		var i;
		var pairPerRow = false;
		var inputString = this.get('inputString');
		if (!inputString ) {
			throw 'Parse error: Input string is blank.';
		}
		var lines = inputString.split(/\r\n|\r|\n/);
		
		// Remove blank lines
		var rows = [];
		for (i = 0; i < lines.length; i++) {
			if (lines[i].trim().length > 0) {
				rows.push(lines[i]);
			}
		}
		if (rows.length === 0) {
			throw 'Parse error: Input string must contain at least 1 row.';
		}
		
		// Pre-parsing (determine format and delimiter)
		var delim = rows[0].match(/[^0-9a-zA-Z .-]/);
		if (!delim) {
			throw 'Parse error: No delimiter found in input string.';
		}
		var columns = rows[0].split(delim);
		var numColumns = columns.length;
		if (numColumns < 2 || numColumns === 2 && 
				columns[1].trim().length === 0) {
			throw 'Parse error: Input string must contain at least 2 columns.';
		}
		else if (numColumns === 2) {
			pairPerRow = true;
		}
		else if (rows.length !== 2) {
			throw 'Parse error: Input string with more than 2 columns must ' +
					'contain 2 rows (row 1 for X values and row 2 for ' +
					'Y values).';
		}
		
		// Now extract the pairs
		var xs = [];
		var ys = [];
		if (pairPerRow) {
			for (i = 0; i < rows.length; i++) {
				var cols = rows[i].split(delim);
				if (cols.length !== 2 || cols.length === 2 && 
						cols[1].trim().length === 0) {
					throw 'Parse error: Row ' + (i+1) + ' must contain ' +
							'2 columns.';
				}
				if (isNaN(cols[0])) {
					throw 'Parse error: Invalid X value in row ' + (i+1) + '.';
				}
				if (isNaN(cols[1])) {
					throw 'Parse error: Invalid Y value in row ' + (i+1) + '.';
				}
				xs.push(Number(cols[0]));
				ys.push(Number(cols[1]));
			}
		} else {
			var colsX = rows[0].split(delim);
			var colsY = rows[1].split(delim);
			if (colsX.length !== numColumns || colsX.length === numColumns && 
					colsX[colsX.length-1].trim().length === 0) {
				throw 'Parse error: Row 1 must contain ' +
						numColumns + ' columns.';
			} else if (colsY.length !== numColumns || colsY.length == 
					numColumns && colsY[colsY.length-1].trim().length === 0) {
				throw 'Parse error: Row 2 must contain ' +
						numColumns + ' columns.';
			}
			for (i = 0; i < colsX.length; i++) {
				if (isNaN(colsX[i])) {
					throw 'Parse error: Invalid X value in row 1, ' +
							'column ' + (i+1) + '.';
				}
				else if (isNaN(colsY[i])) {
					throw 'Parse error: Invalid Y value in row 2, ' +
							'column ' + (i+1) + '.';
				}
				xs.push(Number(colsX[i]));
				ys.push(Number(colsY[i]));
			}
		}
		var curve = new Curve({'xs': xs, 'ys': ys});
		return curve;
	};

	return HazardCurveParser;

});
