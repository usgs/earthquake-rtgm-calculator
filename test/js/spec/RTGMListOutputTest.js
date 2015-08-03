/* global chai, describe, it */
'use strict';

var RTGMListOutput = require('rtgm/RTGMListOutput');


var expect = chai.expect;

describe('Unit tests for the "RTGMListOutput" class', function () {

  describe('constructor()', function () {

    it('Can be instantiated', function () {
      var listoutput = new RTGMListOutput();
      expect(listoutput).to.be.an.instanceOf(RTGMListOutput);
    });
  });
});
