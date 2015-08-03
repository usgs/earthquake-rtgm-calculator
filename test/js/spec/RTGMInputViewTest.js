/* global chai, describe, it, sinon */
'use strict';


var RTGMInputView = require('rtgm/RTGMInputView');


var expect = chai.expect;

var goodCurve = {
  xs: [0.0025, 0.00375, 0.00563],
  ys: [0.4782, 0.3901, 0.3055]
};

var badCurve = {
  xs: [0.0025, 0.00375, 0.00563],
  ys: [0.4782, 0.3901]
};

describe('Unit tests for the "RTGMInputView" class', function () {

  describe('constructor()', function () {
    it('can be required', function () {
      /*jshint -W030*/
      expect(RTGMInputView).to.not.be.undefined;
      /*jshint +W030*/
    });
  });

  describe('Event Bindings', function () {
    var view = new RTGMInputView();

    it('notifies listeners for good input', function () {
      var successCallback = function (evt) {
          expect(evt.curve.get('xs')).to.deep.equal(goodCurve.xs);
          expect(evt.curve.get('ys')).to.deep.equal(goodCurve.ys);
      };
      var successSpy = sinon.spy(successCallback),
          errorSpy = sinon.spy();

      view.on('hazardCurve', successSpy);
      view.on('hazardCurveError', errorSpy);

      view._sa.value = goodCurve.xs.join(',');
      view._afe.value = goodCurve.ys.join(',');
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

      view._sa.value = badCurve.xs.join(',');
      view._sa.value = badCurve.ys.join(',');
      view.parseRequest();

      view.off('hazardCurve', successSpy);
      view.off('hazardCurveError', errorSpy);

      expect(successSpy.callCount).to.equal(0);
      expect(errorSpy.callCount).to.equal(1);
    });
  });
});
