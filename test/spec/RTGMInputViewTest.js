/* global define, describe, it */
define([
	'chai',
	'sinon',
	'rtgm/RTGMInputView',
], function (
	chai,
	sinon,
	RTGMInputView
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

		it('can be required', function () {
			/*jshint -W030*/
			expect(RTGMInputView).to.not.be.undefined;
			/*jshint +W030*/
		});

		var view = new RTGMInputView();

		it('notifies listeners for good input', function () {
			var successCallback = function (evt) {
					expect(evt.curve.get('xs')).to.deep.equal(RESULTDATA.xs);
					expect(evt.curve.get('ys')).to.deep.equal(RESULTDATA.ys);
			};
			var successSpy = sinon.spy(successCallback),
			    errorSpy = sinon.spy();

			view.on('hazardCurve', successSpy);
			view.on('hazardCurveError', errorSpy);

			view._input.value = XYCOLS.inputString;
			view.parseRequest();

			view.off('hazardCurve', successSpy);
			view.off('hazardCurveError', errorSpy);

			expect(successSpy.callCount).to.equal(1);
			expect(errorSpy.callCount).to.equal(0);
		});

		it('notifies listeners for bad input', function () {
			var successSpy = sinon.spy(),
			    errorSpy = sinon.spy();

			view.on('hazardCurve', successSpy);
			view.on('hazardCurveError', errorSpy);

			view._input.value = '';
			view.parseRequest();

			view.off('hazardCurve', successSpy);
			view.off('hazardCurveError', errorSpy);

			expect(successSpy.callCount).to.equal(0);
			expect(errorSpy.callCount).to.equal(1);
		});
	});

});
