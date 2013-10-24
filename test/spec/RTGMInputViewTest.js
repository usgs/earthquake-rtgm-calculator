/*global define*/
/*global describe*/
/*global it*/
define([
	'chai',
	'rtgm/RTGMInputView',
], function (
	chai,
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
		it('good hazard curve', function () {
			view._inputArea.value = XYCOLS.inputString;
			view.parseRequest();

			expect(view._curve.get('xs')).to.deep.equal(RESULTDATA.xs);
			expect(view._curve.get('ys')).to.deep.equal(RESULTDATA.ys);
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
