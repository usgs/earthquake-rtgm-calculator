/* global define, describe, it */
define([
	'chai',
	'sinon',
	'rtgm/Curve',
	'rtgm/RTGMCalculator'
], function (
	chai,
	sinon,
	Curve,
	RTGMCalculator
) {
	'use strict';
	var expect = chai.expect;

	describe('RTGMCalculator', function () {
		describe('constructor()', function () {
			it('Can be required', function () {
				/* jshint -W030 */
				expect(RTGMCalculator).not.to.be.null;
				/* jshint +W030 */
			});

			it('Can be instantiated', function () {
				var calc = new RTGMCalculator();
				expect(calc).to.be.an.instanceof(RTGMCalculator);

				calc = new RTGMCalculator('/some/url');
				expect(calc).to.be.an.instanceof(RTGMCalculator);

				calc = new RTGMCalculator(null, document.createElement('div'));
				expect(calc).to.be.an.instanceof(RTGMCalculator);

				calc = new RTGMCalculator('/some/url', document.createElement('div'));
				expect(calc).to.be.an.instanceof(RTGMCalculator);
			});
		});

		describe('calculate', function () {
			var curve = new Curve({
				xs: [0.01,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.4,1.7,2],
				ys: [0.5696,0.088335,0.02925,0.01229725,0.00564925,0.00275075,
						0.001385175,0.000733875,0.0003984225,0.0002205625,0.0001235975,
						0.00006881825,0.0000382493775,0.0000113329875,0.00000134645,
						0.000000064884]
			});
			//var goodCalc = new RTGMCalculator('http://localhost:8080/service');
			var badCalc = new RTGMCalculator('http://localhost:8080/foobar');

			// it('calls success handler on success', function (done) {
			// 	var complete = null,
			// 	    successCallback = sinon.spy(function () { complete(); }),
			// 	    errorCallback = sinon.spy(function () { complete(); });


			// 	goodCalc.on('success', successCallback);
			// 	goodCalc.on('error', errorCallback);
			// 	goodCalc.calculate(curve);

			// 	complete = function () {

			// 		expect(successCallback.callCount).to.equal(1);
			// 		expect(errorCallback.callCount).to.equal(0);

			// 		goodCalc.off('success', successCallback);
			// 		goodCalc.off('error', errorCallback);
			// 		done();
			// 	};
			// });

			it('calls error handler on error', function (done) {
				var complete = null,
				    successCallback = sinon.spy(function () { complete(); }),
				    errorCallback = sinon.spy(function () { complete(); });


				badCalc.on('success', successCallback);
				badCalc.on('error', errorCallback);
				badCalc.calculate(curve);

				complete = function () {

					expect(successCallback.callCount).to.equal(0);
					expect(errorCallback.callCount).to.equal(1);

					badCalc.off('success', successCallback);
					badCalc.off('error', errorCallback);
					done();
				};
			});
		});
	});
});
