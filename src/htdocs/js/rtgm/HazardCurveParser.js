/*global define*/

define([
	'rtgm/Curve'
], function (Curve) {
	'use strict';

	var HazardCurveParser = {

		EXCEPTIONS: {
			BLANK: 'Parse error: Input string is blank.',
			INVALID_X: 'Parse error: Invalid X value in row ',
			INVALID_Y: 'Parse error: Invalid X value in row ',
			LESS_THAN_TWO_COLUMNS: 'Parse error: Input string must contain '+
					'at least 2 columns.',
			NO_DELIM: 'Parse error: No delimiter found in input string.',
			NO_ROWS: 'Parse error: Input string must contain at least 1 row.',
			TWO_ROWS_REQUIRED: 'Parse error: Input string with more than 2' +
					'columns must contain 2 rows (row 1 for X values and' +
					'row 2 for Y values).'
		},

		invalidNumCols: function (row, ncols) {
			return 'Parse error: Row ' + row + ' must contain ' + ncols +
					' columns.';
		},

		invalidVal: function (dim, row, col) {
			return 'Parse error: Invalid ' + dim + ' value in row ' + row +
					', column ' + col + '.';
		},

		/**
		* Parses the input string into a curve object containing the
		* appropriate X and Y arrays.  Allows for two types of formats:
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
		parse: function (data) {
			var i;
			var pairPerRow = false;
			var inputString = null;
			if (!data || !(inputString = data.inputString)) {
				throw this.EXCEPTIONS.BLANK;
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
				throw this.EXCEPTIONS.NO_ROWS;
			}

			// Pre-parsing (determine format and delimiter)
			var delim = rows[0].match(/[^0-9a-zA-Z .-]/);
			if (!delim) {
				throw this.EXCEPTIONS.NO_DELIM;
			}
			var columns = rows[0].split(delim);
			var numColumns = columns.length;
			if (numColumns < 2 || numColumns === 2 &&
					columns[1].trim().length === 0) {
				throw this.EXCEPTIONS.LESS_THAN_TWO_COLUMNS;
			} else if (numColumns === 2) {
				pairPerRow = true;
			} else if (rows.length !== 2) {
				throw this.EXCEPTIONS.TWO_ROWS_REQUIRED;
			}

			// Now extract the pairs
			var xs = [];
			var ys = [];
			if (pairPerRow) {
				for (i = 0; i < rows.length; i++) {
					var cols = rows[i].split(delim);
					if (cols.length !== 2 || cols.length === 2 &&
							cols[1].trim().length === 0) {
						throw this.invalidNumCols((i+1), 2);
					}
					if (isNaN(cols[0])) {
						throw this.invalidVal('X', (i+1), 1);
					}
					if (isNaN(cols[1])) {
						throw this.invalidVal('Y', (i+1), 2);
					}
					xs.push(Number(cols[0]));
					ys.push(Number(cols[1]));
				}
			} else {
				var colsX = rows[0].split(delim);
				var colsY = rows[1].split(delim);
				if (colsX.length !== numColumns || colsX.length === numColumns &&
						colsX[colsX.length-1].trim().length === 0) {
					throw this.invalidNumCols(1, numColumns);
				} else if (colsY.length !== numColumns || colsY.length ===
						numColumns && colsY[colsY.length-1].trim().length ===
						0) {
					throw this.invalidNumCols(2, numColumns);
				}
				for (i = 0; i < colsX.length; i++) {
					if (isNaN(colsX[i])) {
						throw this.invalidVal('X', 1, (i+1));
					}
					else if (isNaN(colsY[i])) {
						throw this.invalidVal('Y', 2, (i+1));
					}
					xs.push(Number(colsX[i]));
					ys.push(Number(colsY[i]));
				}
			}
			var curve = new Curve({'xs': xs, 'ys': ys});
			return curve;
		}
	};

	return HazardCurveParser;

});
