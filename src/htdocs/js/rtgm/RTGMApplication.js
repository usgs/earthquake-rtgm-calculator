'use strict';

var RTGMCalculator = require('rtgm/RTGMCalculator'),
    RTGMGraphOutput = require('rtgm/RTGMGraphOutput'),
    RTGMInputView = require('rtgm/RTGMInputView'),
    RTGMListOutput = require('rtgm/RTGMListOutput'),

    Collection = require('mvc/Collection'),
    ModalView = require('mvc/ModalView'),

Util = require('util/Util');


var DEFAULTS = {

};

var RTGMApplication = function (options) {
  options = Util.extend({}, DEFAULTS, options || {});
  this.el = options.el || document.createElement('div');
  this._baseUrl = options.baseUrl || '';

  this._initialize();
};

RTGMApplication.prototype._initialize = function () {
  this.el.classList.add('rtgm-application');

  this._collection = Collection();
  this._calculator = new RTGMCalculator(this._baseUrl + '/service');
  this._calculator.on('success', this._rtgmSuccess, this);
  this._calculator.on('error', this._handleError, this);

  this._inputView = new RTGMInputView({
    el: this.el.appendChild(document.createElement('div'))
  });
  this._inputView.on('hazardCurve', this.computeHazard, this);
  this._inputView.on('hazardCurveError', this._handleError, this);

  this._listOutput = new RTGMListOutput({
    el: this.el.appendChild(document.createElement('div')),
    collection: this._collection
  });

  this._graphOutput = new RTGMGraphOutput({
    el: this.el.appendChild(document.createElement('div')),
    collection: this._collection
  });

};

RTGMApplication.prototype.computeHazard = function (evt) {
  this._calculator.calculate(evt.curve, evt.title);
};

RTGMApplication.prototype._rtgmSuccess = function (rtgm) {
  this._collection.add(rtgm);
};

RTGMApplication.prototype._handleError = function (error) {
  ModalView(error.message, {
    classes: ['modal-error'],
    title: 'Application Error'
  }).show();
};

module.exports =  RTGMApplication;
