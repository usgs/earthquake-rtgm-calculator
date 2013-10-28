/* global define */
define([
	'util/Util',
	'mvc/View',
	'mvc/Collection'
], function (
	Util,
	View,
	Collection
) {
	'use strict';

	var LIST_VIEW_COUNTER = 0;
	var DEFAULTS = {

	};

	var RTGMListOutput = function (options) {
		options = Util.extend({}, DEFAULTS, options || {});

		this._id_prefix = 'list-output-' + (LIST_VIEW_COUNTER++) + '-';
		this._collection = options.collection || new Collection();
		
		View.call(this, options);
	};
	RTGMListOutput.prototype = Object.create(View.prototype);

	RTGMListOutput.prototype.render = function () {
		var html = [],
		    data = this._collection.data().slice(0),
		    numData = data.length,
		    i = null;

		for (i = 0; i < numData; i++) {
			html.push(this._renderItem(data[i]));
		}

		this._list.innerHTML = html.join('');
		this._list.scrollTop = this._list.scrollHeight;
	};

	RTGMListOutput.prototype._initialize = function () {
		Util.addClass(this._el, 'rtgm-list-output');
		this._list = this._el.appendChild(document.createElement('ul'));

		Util.addEvent(this._list, 'click', (function (scope) {
			return function (evt) {
				var item = Util.getParentNode(Util.getEvent(evt).target, 'li',
						this._list);

				if (item !== null && Util.hasClass(item, 'rtgm-list-item')) {
					scope._onItemClick(item);
				}
			};
		})(this));

		this._collection.on('add', this._onCollectionAdd, this);
		this._collection.on('select', this._onCollectionSelect, this);
		this._collection.on('deselect', this._onCollectionDeselect, this);
	};

	RTGMListOutput.prototype._renderItem = function (item) {
		return [
			'<li id="', this._getItemId(item), '" class="rtgm-list-item">',
				'<span class="rtgm-title">', item.get('title'), '</span>',
				'<a href="', item.get('url'), '" class="rtgm-list-download">',
					'Raw Data Results',
				'</a>',
				'<dl class="rtgm-summary">',
					'<dt><abbr title="Uniform Hazarzd Ground Motion">UHGM</dt>',
					'<dd>', this._formatNumber(item.get('uhgm'), 3), '</dd>',

					'<dt><abbr title="Risk Targeted Ground Motion">RTGM</dt>',
					'<dd>', this._formatNumber(item.get('rtgm'), 3), '</dd>',

					'<dt><abbr title="Risk Coefficient">RC</dt>',
					'<dd>', this._formatNumber(item.get('riskCoefficient'), 2), '</dd>',
				'</dl>',
			'</li>'
		].join('');
	};

	RTGMListOutput.prototype._onItemClick = function (item) {
		this._collection.select(this._collection.get(
				item.getAttribute('id').replace(this._id_prefix, '')));
	};

	RTGMListOutput.prototype._onCollectionAdd = function (items) {
		// Render all the current items (including this new item)
		this.render();

		// Always select most recently added item
		this._collection.select(items[items.length - 1]);
	};

	RTGMListOutput.prototype._onCollectionSelect = function (selected) {
		Util.addClass(this._el.querySelector('#' + this._getItemId(selected)),
			'selected');
	};

	RTGMListOutput.prototype._onCollectionDeselect = function (oldSelected) {
		Util.removeClass(this._el.querySelector('#' + this._getItemId(oldSelected)),
			'selected');
	};

	RTGMListOutput.prototype._getItemId = function (item) {
		return this._id_prefix + item.id;
	};

	RTGMListOutput.prototype._formatNumber = function (num, precision) {
		var factor = null;

		if (typeof precision !== 'number') {
			precision = 4;
		}

		factor = Math.pow(10, precision);

		return Math.round(num * factor) / factor;
	};

	return RTGMListOutput;
});
