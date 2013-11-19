/* global define */
define([
	'util/Util',
	'mvc/Collection',
	'mvc/ModalView',

	'rtgm/RTGMCalculator',
	'rtgm/RTGMInputView',
	'rtgm/RTGMListOutput',
	'rtgm/RTGMGraphOutput'
], function (
	Util,
	Collection,
	ModalView,

	RTGMCalculator,
	RTGMInputView,
	RTGMListOutput,
	RTGMGraphOutput
) {
	'use strict';

	var DEFAULTS = {

	};

	var RTGMApplication = function (options) {
		options = Util.extend({}, DEFAULTS, options || {});
		this._el = options.el || document.createElement('div');

		this._initialize();
	};

	RTGMApplication.prototype._initialize = function () {
		Util.addClass(this._el, 'rtgm-application');

		this._collection = new Collection();
		this._calculator = new RTGMCalculator();
		this._calculator.on('success', this._rtgmSuccess, this);
		this._calculator.on('error', this._handleError, this);

		this._inputView = new RTGMInputView({
			el: this._el.appendChild(document.createElement('div'))
		});
		this._inputView.on('hazardCurve', this.computeHazard, this);
		this._inputView.on('hazardCurveError', this._handleError, this);

		this._listOutput = new RTGMListOutput({
			el: this._el.appendChild(document.createElement('div')),
			collection: this._collection
		});

		this._graphOutput = new RTGMGraphOutput({
			el: this._el.appendChild(document.createElement('div')),
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
		new ModalView(error.ex, {classes: ['modal-error'], title: 'Error'}).show();
	};

	return RTGMApplication;
});
