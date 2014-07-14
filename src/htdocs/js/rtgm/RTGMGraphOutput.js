/* global define */
define([
	'util/Util',
	'mvc/Collection',
	'mvc/View',
	'dygraph'
], function (
	Util,
	Collection,
	View,
	Dygraph
) {
	'use strict';

	var DEFAULTS = {

	};

	var GRAPH_DEFAULTS = {
		xlabel: 'Spectral Response Acceleration',
		drawGrid: false,
		drawPoints: true,
		sigFigs: 3,
		digitsAfterDecimal: 3,
		yAxisLabelWidth: 85, /* Sync with CSS dyraph-label#text-indent */
		xRangePad: 25.0,
		yRangePad: 25.0,
		labelsSeparateLines: true,
		legend: 'always',
		axes: {
			x: {
				axisLabelFormatter: function (val) {
					return Math.round(Math.exp(val)*1000)/1000;
				},
				valueFormatter: function (val) {
					return 'Spectral Response Acceleration: ' +
							Math.round(Math.exp(val)*1000)/1000;
				}
			}
		}
	};

	var TARGETRISK = -1.0 * Math.log(1.0 - 0.01) / 50.0;
	var AFE4UHGM = -1.0 * Math.log(1.0 - 0.02) / 50.0;

	var COLORS = [
		['#00FF00'],
		['#00FF00', '#FF0000'],
		['#00FF00', '#0000FF', '#FF0000'],
		['#00FF00', '#00FFFF', '#0000FF', '#FF0000'],
		['#00FF00', '#00FFFF', '#0000FF', '#FF00FF', '#FF0000']
	];

	var RTGMGraphOutput = function (options) {
		options = Util.extend({}, DEFAULTS, options || {});

		this._collection = options.collection || new Collection();

		View.call(this, options);
	};
	RTGMGraphOutput.prototype = Object.create(View.prototype);

	RTGMGraphOutput.prototype.render = function (item) {
		var iterations = item.get('iterations'),
		    sa = item.get('upsampledHazardCurve').xs,
		    afe = item.get('upsampledHazardCurve').ys,
		    originalMin = item.get('originalHCMin'),
		    originalMax = item.get('originalHCMax'),
		    colors = COLORS[iterations.length - 1],
		    labels = ['SA'], pdf = [], cdf = [], integrand = [], risk = [],
		    i = null, numIters = iterations.length, iter = null;

		for (i = 0; i < numIters; i++) {
			labels.push('Iteration ' + (i+1));
			iter = iterations[i];
			pdf.push(iter.pdf);
			cdf.push(iter.cdf);
			integrand.push(iter.integrand);
			risk.push(iter.integral);
		}

		labels[labels.length - 1] = 'Final Iteration';

		this._renderHazardGraph(originalMin, originalMax, sa, afe, {
			underlayCallback: function(canvas, area, g) {
				// Need to take the ln of AFE4UHGM because all points on this graph are similarly transformed.
				var coords = g.toDomCoords(0, Math.log(AFE4UHGM));

				canvas.strokeStyle = 'black';
				canvas.lineWidth = 2;
				canvas.beginPath();
				canvas.moveTo(area.x, coords[1]);
				canvas.lineTo(area.x + area.w, coords[1]);
				canvas.stroke();
			}
		});
		this._renderGraph(this._cdfGraphOutput, sa, cdf, {
			title: 'Fragility Curves',
			ylabel: 'Conditional Collapse Probability',
			colors: colors,
			labels: labels,
			underlayCallback: function(canvas, area, g) {
				var coords = g.toDomCoords(0, TARGETRISK);

				canvas.strokeStyle = 'black';
				canvas.lineWidth = 2;
				canvas.beginPath();
				canvas.moveTo(area.x, coords[1]);
				canvas.lineTo(area.x + area.w, coords[1]);
				canvas.stroke();
			}
		});
		this._renderGraph(this._pdfGraphOutput, sa, pdf, {
			title: 'Derivative of Fragility Curves',
			ylabel: 'Conditional Collapse Probability Density',
			colors: colors,
			labels: labels
		});
		this._renderGraph(this._integrandGraphOutput, sa, integrand, {
			title: 'Hazard Curve &times; Derivative of Fragility Curves',
			ylabel: 'Annual Collapse Frequency Density',
			colors: colors,
			labels: labels
		});
		this._renderGraph(this._riskGraphOutput, sa, risk, {
			title: 'Cumulative Integral of Hazard Curve &times; Derivative of ' +
					'Fragility Curves',
			ylabel: 'Cumulative 50-Year Collapse Probability',
			colors: colors,
			labels: labels,
			ymutatefn: function (val) {
				return 1 - Math.exp(-1.0 * val * 50);
			},
			underlayCallback: function(canvas, area, g) {
				var coords = g.toDomCoords(0, 0.01);

				canvas.strokeStyle = 'black';
				canvas.lineWidth = 2;
				canvas.beginPath();
				canvas.moveTo(area.x, coords[1]);
				canvas.lineTo(area.x + area.w, coords[1]);
				canvas.stroke();
			}
		});
	};

	RTGMGraphOutput.prototype._initialize = function () {
		Util.addClass(this._el, 'rtgm-graph-output');

		this._hazardGraphOutput = this._el.appendChild(
				document.createElement('div'));
		Util.addClass(this._hazardGraphOutput, 'graph');

		this._cdfGraphOutput = this._el.appendChild(
				document.createElement('div'));
		Util.addClass(this._cdfGraphOutput, 'graph');

		this._pdfGraphOutput = this._el.appendChild(
				document.createElement('div'));
		Util.addClass(this._pdfGraphOutput, 'graph');
		Util.addClass(this._pdfGraphOutput, 'page-break');

		this._integrandGraphOutput = this._el.appendChild(
				document.createElement('div'));
		Util.addClass(this._integrandGraphOutput, 'graph');

		this._riskGraphOutput = this._el.appendChild(
				document.createElement('div'));
		Util.addClass(this._riskGraphOutput, 'graph');

		this._legend = document.createElement('div');

		this._collection.on('select', this.render, this);
	};

	RTGMGraphOutput.prototype._renderHazardGraph = function (oMin, oMax, xvals,
				yvals, options) {
		var dataStr = [], oMinIdx = 0, oMaxIdx = xvals.length,
		    i = null, numVals = xvals.length, formatFn = null;

		formatFn = function (val) {
			var newVal = Math.exp(val);
			if (newVal < 10e-4) {
				var parts = newVal.toExponential().split('e');
				return parts[0].substring(0, 3) + 'e' + parts[1];
			} else {
				return (Math.round(newVal*1000)/1000).toFixed(3);
			}
		};

		for (i = 0; i < numVals; i++) {
			if (xvals[i] < oMin) {
				oMinIdx = i;
			}
			if (xvals[i] > oMax) {
				oMaxIdx = Math.min(oMaxIdx, i);
			}
			dataStr.push([Math.log(xvals[i]), Math.log(yvals[i])].join(','));
		}

		this._hazardGraphOutput.innerHTML = '';
		new Dygraph(this._hazardGraphOutput, dataStr.join('\n'), Util.extend({},
			GRAPH_DEFAULTS, options || {}, {
			title: 'Hazard Curve',
			labels: ['SA', 'AFE'],
			ylabel: 'Annual Frequence of Exceedance',
			digitsAfterDecimal: 4,
			drawPointCallback: function (g, name, ctx, cx, cy, color, sz, idx) {
				if (idx < oMinIdx || idx > oMaxIdx) {
					return Dygraph.Circles.CIRCLE(g, name, ctx, cx, cy, color, 2*sz, idx);
				} else {
					return Dygraph.Circles.DEFAULT(g, name, ctx, cx, cy, color, sz, idx);
				}
			},
			axes: Util.extend({}, GRAPH_DEFAULTS.axes, {
				y: {
					axisLabelFormatter: formatFn,
					valueFormatter: formatFn
				}
			}),
			colors: ['#000000']
		}));
	};

	RTGMGraphOutput.prototype._renderGraph = function (container, xvals, yvals,
			options) {

		var dataStr = [], lineStr = null, fn = function (val) { return val; },
		    i = null, numVals = xvals.length, j = null, numSets = yvals.length;

		if (options.ymutatefn) {
			fn = options.ymutatefn;
			delete options.ymutatefn;
		}

		for (i = 0; i < numVals; i++) {
			lineStr = [Math.log(xvals[i])];
			for (j = 0; j < numSets; j++) {
				lineStr.push(fn(yvals[j][i]));
			}
			dataStr.push(lineStr.join(','));
		}

		container.innerHTML = '';
		new Dygraph(container, dataStr.join('\n'), Util.extend({}, GRAPH_DEFAULTS,
			options || {}));
	};

	return RTGMGraphOutput;
});
