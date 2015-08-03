'use strict';

var Model = require('mvc/Model'),

    Events = require('util/Events'),
    Util = require('util/Util');


var DEFAULT_BASE_URL = '/service';
var JSON_CALLBACK_INCREMENT = 0;

var __json_callback = function () {
  return [
    'rtgmcalculator',
    (new Date()).getTime(),
    JSON_CALLBACK_INCREMENT++
  ].join('_');
};

var RTGMCalculator = function (baseUrl, parentNode) {
  Util.extend(this, Events());

  this._baseUrl = baseUrl || DEFAULT_BASE_URL;
  this._parentNode = parentNode ||
      document.querySelector('script').parentNode;
};

RTGMCalculator.prototype.calculate = function (curve, title) {

  var _this = this,
      script = document.createElement('script'),
      uniqueCallback = __json_callback(),
      onError, cleanup = null;

  onError = function () {
    _this.trigger('error', {
      status: null,
      message: 'The server failed to process your request. ' +
             'Please try again later.'
    });
    cleanup();
  };

  cleanup = function () {
    script.parentNode.removeChild(script);
    script.removeEventListener('error', onError);
    onError = null;
    cleanup = null;
    window[uniqueCallback] = null;
    delete window[uniqueCallback];
  };

  window[uniqueCallback] = function (data) {
    var attrs = null;
    if (data.status === 200) {
      attrs = Util.extend({}, data.rtgm, {
        title: title,
        id: (new Date()).getTime(),
        url: script.src.replace('/' + uniqueCallback, '')
      });

      _this.trigger('success', Model(attrs));
    } else {
      _this.trigger('error', data);
    }
    cleanup();
  };

  script.async = 1;
  script.src = this._createScriptUrl(curve, uniqueCallback);
  script.addEventListener('error', onError);
  this._parentNode.appendChild(script);
};

RTGMCalculator.prototype._createScriptUrl = function (curve, callback) {
  var url = [
    this._baseUrl, '/',
    curve.get('xs').join(','), '/',
    curve.get('ys').join(','),
  ];
  if (typeof callback === 'string') {
    url.push('/' + callback);
  }
  return url.join('');
};

module.exports = RTGMCalculator;
