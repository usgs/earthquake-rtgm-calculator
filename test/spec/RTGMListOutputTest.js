/* global define */
/* global describe */
/* global it */

define([
	'chai',
	'rtgm/RTGMListOutput'
], function (chai, RTGMListOutput) {
	'use strict';
	var expect = chai.expect;

	describe('Unit tests for the "RTGMListOutput" class', function () {

		describe('constructor()', function () {

			it('Can be instantiated', function () {
				var listoutput = new RTGMListOutput();
				expect(listoutput).to.be.an.instanceOf(RTGMListOutput);
			});
		});
	});

});
