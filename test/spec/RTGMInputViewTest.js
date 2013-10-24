/*global define*/
/*global describe*/
/*global it*/
define([
	'chai',
	'rtgm/RTGMInputView',
	'rtgm/Curve'
], function (
	chai,
	RTGMInputView,
	Curve
) {

	'use strict';
	var expect = chai.expect;

	var RESULTDATA = {
		'xs': [0.0025, 0.00375, 0.00563],
		'ys': [0.4782, 0.3901, 0.3055]
	};

	var XYCOLS = {
		'inputString': '0.0025	0.4782\n0.00375	0.3901\n0.00563	0.3055\n'
	};

	describe('Unit tests for the "RTGMInputView" class', function () {

		var testBaselineCalculator = {
			inclination : function () { return 1; },
			horizontalComponent : function () { return 2; },
			verticalComponent : function () { return 3; },
			southDownMinusNorthUp : function () { return 4; },
			northDownMinusSouthUp : function () { return 5; }
		};

		it('can be required', function () {
			/*jshint -W030*/
			expect(RTGMInputView).to.not.be.undefined;
			/*jshint +W030*/
		});

		var view = new RTGMInputView();
		it('good hazard curve', function () {
			view._inputArea.value = XYCOLS.inputString;
			view.parseRequest();

			/*jshint -W030*/
			expect(view._curve.get('xs')).to.deep.equal(RESULTDATA.xs);
			expect(view._curve.get('ys')).to.deep.equal(RESULTDATA.ys);
			/*jshint +W030*/
		});

		it('bad hazard curve', function () {
			view._inputArea.value = '';
			view.parseRequest();

			/*jshint -W030*/
			expect(view._curve).to.be.null;
			/*jshint +W030*/
		});
	});

});
