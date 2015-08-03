/* global chai, describe, it, sinon */
'use strict';


var RTGMApplication = require('rtgm/RTGMApplication');


var expect = chai.expect;


describe('RTGMApplication', function () {

  describe('constructor', function () {
    it('can be required', function () {
      /* jshint -W030 */
      expect(RTGMApplication).to.not.be.undefined;
      /* jshint +W030 */
    });

    it('can be instantiated', function () {
      expect(new RTGMApplication()).to.be.an.instanceof(RTGMApplication);
    });

    it('accepts a container element', function () {
      var container = document.createElement('div'),
          app = new RTGMApplication({el: container});

       expect(app.el).to.equal(container);
    });

    it('creates a container if not specified', function () {
      var app = new RTGMApplication();
      /* jshint -W030 */
      expect(app.el).not.to.be.undefined;
      /* jshint +W030 */
    });

    it('creates an input view', function () {
      var app = new RTGMApplication();
      /* jshint -W030 */
      expect(app._inputView).not.to.be.undefined;
      /* jshint +W030 */
    });

    it('creates a list output view', function () {
      var app = new RTGMApplication();
      /* jshint -W030 */
      expect(app._listOutput).not.to.be.undefined;
      /* jshint +W030 */
    });

    it('creates a graph output view', function () {
      var app = new RTGMApplication();
      /* jshint -W030 */
      expect(app._graphOutput).not.to.be.undefined;
      /* jshint +W030 */
    });

    it('creates a calculator', function () {
      var app = new RTGMApplication();
      /* jshint -W030 */
      expect(app._calculator).not.to.be.undefined;
      /* jshint +W030 */
    });
  });

  describe('Event Handlers', function () {
    var handleErrorSpy = sinon.stub(RTGMApplication.prototype,
        '_handleError');
    var serviceSuccessSpy = sinon.stub(RTGMApplication.prototype,
        '_rtgmSuccess');
    var computeHazardSpy = sinon.stub(RTGMApplication.prototype,
        'computeHazard');
    var app = new RTGMApplication();

    it('reacts to server successes', function () {
      app._calculator.trigger('success', {});
      expect(serviceSuccessSpy.callCount).to.equal(1);
    });

    it('reacts to hazard curve events', function () {
      app._inputView.trigger('hazardCurve', {});
      expect(computeHazardSpy.callCount).to.equal(1);
    });

    it('reacts to errors', function () {
      var callCount = 0;

      app._calculator.trigger('error', {});
      expect(handleErrorSpy.callCount).to.equal(++callCount);

      app._inputView.trigger('hazardCurveError', {});
      expect(handleErrorSpy.callCount).to.equal(++callCount);
    });

    RTGMApplication.prototype.computeHazard.restore();
    RTGMApplication.prototype._rtgmSuccess.restore();
    RTGMApplication.prototype._handleError.restore();
  });
});
