/* global chai, describe, it */
'use strict';

var HazardCurveParser = require('rtgm/HazardCurveParser');


var expect = chai.expect;


var BADX_C = 'abc	0.4782\n0.00375	0.3901\n0.00563	0.3055\n';
var BADX_R = '0.0025, 0.00375, xyz\n0.4782, 0.3901, 0.3055\n\n';
var BADY_C = '0.0025	0.4782\n0.00375	0.3901\n0.00563	def\n';
var BADY_R = '0.0025, 0.00375, 0.00563\n0.4782, zzz, 0.3055\n\n';
var DIFFCOLS_C = '0.0025	0.4782\n0.3901\n0.00563	0.3055\n';
var DIFFCOLS_R = '0.0025, 0.00375, 0.00563\n0.4782, 0.3901\n\n';
var NO_DELIM = '0.0025 0.4782\n0.00375 0.3901\n0.00563 0.3055\n';
var NO_ROWS = '\n\n';
var ONE_COL = '0.0025|\n';
var RESULTDATA = {
  'xs': [0.0025, 0.00375, 0.00563],
  'ys': [0.4782, 0.3901, 0.3055]
};
var THREE_ROWS = '0.0025;0.00375;0.00563\n0.4782;0.3901;0.3055\n' +
      '0.0025;0.00375;0.00563\n';
var XYCOLS = '0.0025	0.4782\n0.00375	0.3901\n0.00563	0.3055\n';
var XYROWS = '0.0025, 0.00375, 0.00563\n0.4782, 0.3901, 0.3055\n\n';

describe('Unit tests for the "HazardCurveParser" class', function () {


  describe('constructor()', function () {

    var curve;
    var func;

    it('Good XY rows (csv)', function () {
      curve = HazardCurveParser.parse(XYROWS);
      expect(curve.get('xs')).to.deep.equal(RESULTDATA.xs);
      expect(curve.get('ys')).to.deep.equal(RESULTDATA.ys);
    });

    it('Good XY columns (tab-delimited)', function () {
      curve = HazardCurveParser.parse(XYCOLS);
      expect(curve.get('xs')).to.deep.equal(RESULTDATA.xs);
      expect(curve.get('ys')).to.deep.equal(RESULTDATA.ys);
    });

    it('No input string', function () {
      func = function() {
        HazardCurveParser.parse();
      };
      expect(func).to.throw(HazardCurveParser.EXCEPTIONS.BLANK);
    });

    it('No rows', function () {
      func = function() {
        HazardCurveParser.parse(NO_ROWS);
      };
      expect(func).to.throw(HazardCurveParser.EXCEPTIONS.NO_ROWS);
    });

    it('No delimiter', function () {
      func = function() {
        HazardCurveParser.parse(NO_DELIM);
      };
      expect(func).to.throw(HazardCurveParser.EXCEPTIONS.NO_DELIM);
    });

    it('At least two columns', function () {
      func = function() {
        HazardCurveParser.parse(ONE_COL);
      };
      expect(func).to.throw(HazardCurveParser.
          EXCEPTIONS.LESS_THAN_TWO_COLUMNS);
    });

    it('Too many rows', function () {
      func = function() {
        HazardCurveParser.parse(THREE_ROWS);
      };
      expect(func).to.throw(HazardCurveParser.
          EXCEPTIONS.TWO_ROWS_REQUIRED);
    });

    it('XY rows, mismatched number of columns', function () {
      func = function() {
        HazardCurveParser.parse(DIFFCOLS_R);
      };
      expect(func).to.throw(HazardCurveParser.invalidNumCols(2, 3));
    });

    it('XY rows, bad X', function () {
      func = function() {
        HazardCurveParser.parse(BADX_R);
      };
      expect(func).to.throw(HazardCurveParser.invalidVal('X', 1, 3));
    });

    it('XY rows, bad Y', function () {
      func = function() {
        HazardCurveParser.parse(BADY_R);
      };
      expect(func).to.throw(HazardCurveParser.invalidVal('Y', 2, 2));
    });

    it('XY columns, mismatched number of columns', function () {
      func = function() {
        HazardCurveParser.parse(DIFFCOLS_C);
      };
      expect(func).to.throw(HazardCurveParser.invalidNumCols(2, 2));
    });

    it('XY columns, bad X', function () {
      func = function() {
        HazardCurveParser.parse(BADX_C);
      };
      expect(func).to.throw(HazardCurveParser.invalidVal('X', 1, 1));
    });

    it('XY columns, bad Y', function () {
      func = function() {
        HazardCurveParser.parse(BADY_C);
      };
      expect(func).to.throw(HazardCurveParser.invalidVal('Y', 3, 2));
    });
  });
});
