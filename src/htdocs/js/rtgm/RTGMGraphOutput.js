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
		yAxisLabelWidth: 85,
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
					return 'Spectral Response Acceleration: ' + Math.round(Math.exp(val)*1000)/1000;
				}
			}
		}
	};

	var COLORS = [
		['#00F00'],
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

		this._renderHazardGraph(originalMin, originalMax, sa, afe);
		this._renderGraph(this._cdfGraphOutput, sa, cdf, {
			title: 'Fragility Curves',
			ylabel: 'Conditional Collapse Probability',
			colors: colors,
			labels: labels
		});
		this._renderGraph(this._pdfGraphOutput, sa, pdf, {
			title: 'Derivative of Fragility Curves',
			ylabel: 'Conditional Collapse Probability Density',
			colors: colors,
			labels: labels
		});
		this._renderGraph(this._integrandGraphOutput, sa, integrand, {
			title: 'Hazard Curve x Derivative of Fragility Curves',
			ylabel: 'Annual Collapse Frequency Density',
			colors: colors,
			labels: labels
		});
		this._renderGraph(this._riskGraphOutput, sa, risk, {
			title: 'Cumulative Integral of Hazard Curve x Derivative of Fragility Curves',
			ylabel: 'Cumulative 50-Year Collapse Probability',
			colors: colors,
			labels: labels
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

	RTGMGraphOutput.prototype._renderHazardGraph = function (oMin, oMax, xvals, yvals) {
		var dataStr = [], oMinIdx = 0, oMaxIdx = xvals.length,
		    i = null, numVals = xvals.length;

		for (i = 0; i < numVals; i++) {
			if (xvals[i] < oMin) {
				oMinIdx = i;
			}
			if (xvals[i] > oMax) {
				oMaxIdx = Math.min(oMaxIdx, i);
			}
			dataStr.push([Math.log(xvals[i]), yvals[i]].join(','));
		}

		this._hazardGraphOutput.innerHTML = '';
		new Dygraph(this._hazardGraphOutput, dataStr.join('\n'), Util.extend({},
			GRAPH_DEFAULTS, {
			title: 'Hazard Curve',
			labels: ['SA', 'AFE'],
			ylabel: 'Annual Frequence of Exceedance',
			logscale: true,
			drawPointCallback: function (g, name, ctx, cx, cy, color, sz, idx) {
				if (idx < oMinIdx || idx > oMaxIdx) {
					return Dygraph.Circles.CIRCLE(g, name, ctx, cx, cy, color, sz*sz*sz, idx);
				} else {
					return Dygraph.Circles.DEFAULT(g, name, ctx, cx, cy, color, sz, idx);
				}
			},
			colors: ['#000000']
		}));
	};

	RTGMGraphOutput.prototype._renderGraph = function (container, xvals, yvals,
			options) {
		var dataStr = [], lineStr = null,
		    i = null, numVals = xvals.length, j = null, numSets = yvals.length;

		for (i = 0; i < numVals; i++) {
			lineStr = [Math.log(xvals[i])];
			for (j = 0; j < numSets; j++) {
				lineStr.push(yvals[j][i]);
			}
			dataStr.push(lineStr.join(','));
		}

		container.innerHTML = '';
		new Dygraph(container, dataStr.join('\n'), Util.extend({}, GRAPH_DEFAULTS,
			options || {}));
	};

	RTGMGraphOutput.prototype._renderPdfGraph = function (xvals, yvals) {

		var labels = [], dataStr = [], lineStr = null,
		    i = null, numVals = xvals.length, j = null, numSets = yvals.length;

		for (i = 0; i < numVals; i++) {
			lineStr = [Math.log(xvals[i])];
			labels.push('Iteration ' + i);
			for (j = 0; j < numSets; j++) {
				lineStr.push(yvals[j][i]);
			}
			dataStr.push(lineStr.join(','));
		}

		this._pdfGraphOutput.innerHTML = '';
		new Dygraph(this._pdfGraphOutput, dataStr.join('\n'), {
			title: 'Derivative of Fragility Curves',
			labels: labels,
			ylabel: 'Conditional Collapse Probability Density',
			xlabel: 'Spectral Response Acceleration',
			labelsSeparateLines: true,
			drawGrid: false,
			sigFigs: 4,
			yAxisLabelWidth: 85,
			xRangePad: 1.0,
			yRangePad: 1.0,
			labelsDiv: this._legend,
			axes: {
				x: {
					axisLabelFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					},
					valueFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					}
				}
			}
		});
	};

	RTGMGraphOutput.prototype._renderCdfGraph = function (xvals, yvals) {
		var labels = [], dataStr = [], lineStr = null,
		    i = null, numVals = xvals.length, j = null, numSets = yvals.length;

		for (i = 0; i < numVals; i++) {
			lineStr = [Math.log(xvals[i])];
			labels.push('Iteration ' + i);
			for (j = 0; j < numSets; j++) {
				lineStr.push(yvals[j][i]);
			}
			dataStr.push(lineStr.join(','));
		}

		this._cdfGraphOutput.innerHTML = '';
		new Dygraph(this._cdfGraphOutput, dataStr.join('\n'), {
			title: 'Fragility Curves',
			labels: labels,
			ylabel: 'Conditional Probability of Collapse',
			xlabel: 'Spectral Response Acceleration',
			labelsSeparateLines: true,
			drawGrid: false,
			sigFigs: 4,
			yAxisLabelWidth: 85,
			xRangePad: 1.0,
			yRangePad: 1.0,
			labelsDiv: this._legend,
			axes: {
				x: {
					axisLabelFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					},
					valueFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					}
				}
			}
		});
	};

	RTGMGraphOutput.prototype._renderIntegrandGraph = function (xvals, yvals) {
		var labels = [], dataStr = [], lineStr = null,
		    i = null, numVals = xvals.length, j = null, numSets = yvals.length;

		for (i = 0; i < numVals; i++) {
			lineStr = [Math.log(xvals[i])];
			labels.push('Iteration ' + i);
			for (j = 0; j < numSets; j++) {
				lineStr.push(yvals[j][i]);
			}
			dataStr.push(lineStr.join(','));
		}

		this._integrandGraphOutput.innerHTML = '';
		new Dygraph(this._integrandGraphOutput, dataStr.join('\n'), {
			title: 'Hazard Curve x Derivative of Fragility Curve',
			labels: labels,
			ylabel: 'Annual Collapse Frequency Density',
			xlabel: 'Spectral Response Acceleration',
			labelsSeparateLines: true,
			drawGrid: false,
			sigFigs: 4,
			yAxisLabelWidth: 85,
			xRangePad: 1.0,
			yRangePad: 1.0,
			labelsDiv: this._legend,
			axes: {
				x: {
					axisLabelFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					},
					valueFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					}
				}
			}
		});
	};

	RTGMGraphOutput.prototype._renderRiskGraph = function (xvals, yvals) {
		var labels = [], dataStr = [], lineStr = null, ymin = Number.MAX_VALUE, ymax = Number.MIN_VALUE,
		    i = null, numVals = xvals.length, j = null, numSets = yvals.length;

		for (i = 0; i < numVals; i++) {
			lineStr = [Math.log(xvals[i])];
			labels.push('Iteration ' + i);
			for (j = 0; j < numSets; j++) {
				ymin = Math.min(yvals[j][i], ymin);
				ymax = Math.max(yvals[j][i], ymax);
				lineStr.push(yvals[j][i]);
			}
			dataStr.push(lineStr.join(','));
		}

		this._riskGraphOutput.innerHTML = '';
		new Dygraph(this._riskGraphOutput, dataStr.join('\n'), {
			title: 'Cumulative Integral of Hazard Curve x Derivative of Fragility Curve',
			labels: labels,
			ylabel: '50-Year Collapse Probability',
			xlabel: 'Spectral Response Acceleration',
			labelsSeparateLines: true,
			drawGrid: false,
			sigFigs: 4,
			yAxisLabelWidth: 85,
			labelsDiv: this._legend,
			axes: {
				x: {
					axisLabelFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					},
					valueFormatter: function (val) {
						return Math.round(Math.exp(val)*10000)/10000;
					}
				},
				y: {
					valueRange: [ymin/2, ymax+(ymax/2)],
				}
			}
		});
	};

	return RTGMGraphOutput;
});
