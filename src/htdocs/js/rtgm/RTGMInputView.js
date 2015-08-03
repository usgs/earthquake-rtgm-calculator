'use strict';

var Curve = require('rtgm/Curve'),

    View = require('mvc/View'),

    Util = require('util/Util');


var INPUT_VIEW_COUNTER = 0;
var DEFAULTS = {

};

var RTGMInputView = function (options) {
  options = Util.extend({}, DEFAULTS, options);
  Util.extend(this, View(options));

  this._id_prefix = 'rtgm-input-view-' + (INPUT_VIEW_COUNTER++) + '-';

  this._initialize();
};

/**
 * Initialize view, and call render.
 */
RTGMInputView.prototype._initialize = function () {
  var titleId = this._id_prefix + 'title',
      saId = this._id_prefix + 'sa',
      afeId = this._id_prefix + 'afe',
      computeId = this._id_prefix + 'compute';

  this.el.classList.add('rtgm-input-view');

  // build the view skeleton
  this.el.innerHTML = [
      '<label for="', titleId, '" class="rtgm-input-title">',
        'Curve Title',
      '</label>',
      '<input type="text" id="', titleId, '" class="rtgm-input-title" value=""/>',

      '<label for="', saId, '" class="rtgm-input-sa">',
        'Spectral Response Acceleration Values',
        '<span class="help">comma-separated x-values</span>',
      '</label>',
      '<input type="text" id="', saId, '" class="rtgm-input-sa" value=""/>',

      '<label for="', afeId, '" class="rtgm-input-afe">',
        'Annual Frequency of Exceedance Values',
        '<span class="help">comma-separated y-values</span>',
      '</label>',
      '<input type="text" id="', afeId, '" class="rtgm-input-afe" value=""/>',

      '<button id="', computeId, '" class="rtgm-input-button">',
        'Compute RTGM',
      '</button>',
  ].join('');

  this._title = this.el.querySelector('input.rtgm-input-title');
  this._sa = this.el.querySelector('input.rtgm-input-sa');
  this._afe = this.el.querySelector('input.rtgm-input-afe');
  this._compute = this.el.querySelector('button.rtgm-input-button');

  this._compute.addEventListener('click', (function (scope) {
    return function (evt) {
      scope.parseRequest(evt);
    };
  })(this));

  // render the view
  this.render();
};

RTGMInputView.prototype.parseRequest = function () {
  var title = this._title.value,
      sa = this._sa.value.split(','),
      afe = this._afe.value.split(','),
      curve = null;
  try {
    var i;
    for (i = 0; i < sa.length; i++) {
      sa[i] = parseFloat(sa[i]);
    }
    for (i = 0; i < afe.length; i++) {
      afe[i] = parseFloat(afe[i]);
    }
    curve = new Curve({xs: sa, ys: afe});
  } catch (ex) {
    this.trigger('hazardCurveError', {title: title, sa: sa, afe: afe,
        message: ex});
  }

  if (curve !== null) {
    this.trigger('hazardCurve', {title: title, curve: curve});
  }
};

module.exports = RTGMInputView;
