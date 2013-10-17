/* global define */
/* global describe */
/* global it */

define([
	'chai',
	'rtgm/Curve',
	'rtgm/HazardCurveParser',
	'mvc/Model'
], function (chai, Curve, HazardCurveParser, Model) {
	'use strict';
	var expect = chai.expect;

	var BADX_C = {
		'inputString': 'abc	0.4782\n0.00375	0.3901\n0.00563	0.3055\n'
	}
	var BADX_R = {
		'inputString': '0.0025, 0.00375, xyz\n0.4782, 0.3901, 0.3055\n\n'
	}
	var BADY_C = {
		'inputString': '0.0025	0.4782\n0.00375	0.3901\n0.00563	def\n'
	}
	var BADY_R = {
		'inputString': '0.0025, 0.00375, 0.00563\n0.4782, zzz, 0.3055\n\n'
	}
	var DIFFCOLS_C = {
		'inputString': '0.0025	0.4782\n0.3901\n0.00563	0.3055\n'
	}
	var DIFFCOLS_R = {
		'inputString': '0.0025, 0.00375, 0.00563\n0.4782, 0.3901\n\n'
	}
	var NO_DELIM = {
		'inputString': '0.0025 0.4782\n0.00375 0.3901\n0.00563 0.3055\n'
	}
	var NOROWS = {
		'inputString': '\n\n'
	}
	var ONE_COL = {
		'inputString': '0.0025|\n'
	}
	var RESULTDATA = {
		'xs': [0.0025, 0.00375, 0.00563],
		'ys': [0.4782, 0.3901, 0.3055]
	};
	var THREE_ROWS = {
		'inputString': '0.0025;0.00375;0.00563\n0.4782;0.3901;0.3055\n' +
				'0.0025;0.00375;0.00563\n'
	}
	var XYCOLS = {
		'inputString': '0.0025	0.4782\n0.00375	0.3901\n0.00563	0.3055\n'
	}
	var XYROWS = {
		'inputString': '0.0025, 0.00375, 0.00563\n0.4782, 0.3901, 0.3055\n\n'
	}

	describe('Unit tests for the "HazardCurveParser" class', function () {


		describe('constructor()', function () {

			var curve;
			var func;
			var hcp;

			it('Good XY rows (csv)', function () {
				hcp = new HazardCurveParser(XYROWS);
				curve = hcp.parse();
				expect(hcp).to.be.an.instanceOf(HazardCurveParser);
				expect(curve.get('xs')).to.deep.equal(RESULTDATA.xs);
				expect(curve.get('ys')).to.deep.equal(RESULTDATA.ys);
			});

			it('Good XY columns (tab-delimited)', function () {
				hcp = new HazardCurveParser(XYCOLS);
				expect(hcp).to.be.an.instanceOf(HazardCurveParser);
				curve = hcp.parse();
				expect(curve.get('xs')).to.deep.equal(RESULTDATA.xs);
				expect(curve.get('ys')).to.deep.equal(RESULTDATA.ys);
			});

			it('No input string', function () {
				hcp = new HazardCurveParser();
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: Input string is blank.');
			});

			it('No rows', function () {
				hcp = new HazardCurveParser(NOROWS);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: Input string must ' +
						'contain at least 1 row.');
			});

			it('No delimiter', function () {
				hcp = new HazardCurveParser(NO_DELIM);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: No delimiter found in ' +
						'input string.');
			});

			it('At least two columns', function () {
				hcp = new HazardCurveParser(ONE_COL);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: Input string must ' +
						'contain at least 2 columns.');
			});

			it('Too many rows', function () {
				hcp = new HazardCurveParser(THREE_ROWS);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: Input string with more ' +
					'than 2 columns must contain 2 rows (row 1 for X values ' +
					'and row 2 for Y values).');
			});

			it('XY rows, mismatched number of columns', function () {
				hcp = new HazardCurveParser(DIFFCOLS_R);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: Row 2 must contain ' +
						'3 columns.');
			});

			it('XY rows, bad X', function () {
				hcp = new HazardCurveParser(BADX_R);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Invalid X value in row 1, column 3.');
			});

			it('XY rows, bad Y', function () {
				hcp = new HazardCurveParser(BADY_R);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Invalid Y value in row 2, column 2.');
			});

			it('XY columns, mismatched number of columns', function () {
				hcp = new HazardCurveParser(DIFFCOLS_C);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Parse error: Row 2 must contain ' +
						'2 columns.');
			});

			it('XY columns, bad X', function () {
				hcp = new HazardCurveParser(BADX_C);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Invalid X value in row 1.');
			});

			it('XY columns, bad Y', function () {
				hcp = new HazardCurveParser(BADY_C);
				func = function() {
					hcp.parse();
				};
				expect(func).to.throw('Invalid Y value in row 3.');
			});
		});
	});

});
