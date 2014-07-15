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

	var sciNote = function (val, suppressCoefficient) {
		var parts = val.toExponential().split('e'),
		    formatted = '';

		if (!suppressCoefficient) {
			formatted = parseFloat(parts[0]).toFixed(1);

			if (parts.length > 1) {
				formatted += '&times;';
			}
		}

		if (parts.length > 1) {
			formatted += '10<sup>' + parts[1] + '</sup>';
		}

		if (formatted !== '') {
			return formatted;
		} else {
			return val;
		}
	};

	var drawLine = function (from, to, context, color, width) {
		var originalStrokeStyle = context.strokeStyle,
		    originalLineWidth = context.lineWidth;

		if (typeof color === 'undefined') {
			color = 'black';
		}
		if (typeof width === 'undefined') {
			width = 1;
		}

		context.strokeStyle = color;
		context.lineWidth = width;

		context.beginPath();
		context.moveTo(from[0], from[1]);
		context.lineTo(to[0], to[1]);
		context.closePath();

		context.stroke();

		context.strokeStyle = originalStrokeStyle;
		context.lineWidth = originalLineWidth;
	};

	// TODO :: Improve this to use a b-tree style search rather than linear
	var getIntersection = function (xvals, yvals, y) {
		var i = 0, len = yvals.length, xmin, xmax, ymin, ymax;

		try {
			for (; i < len; i++) {
				if (yvals[i] > y) {
					xmin = xvals[i - 1];
					xmax = xvals[i];
					ymin = yvals[i - 1];
					ymax = yvals[i];
					break;
				}
			}

			return xmin + ((xmax - xmin) * ((y - ymin) / (ymax - ymin)));
		} catch (e) {
			return Math.NaN;
		}
	};

	var GRAPH_DEFAULTS = {
		xlabel: 'Spectral Response Acceleration (g)',
		drawGrid: false,
		drawPoints: true,
		sigFigs: 3,
		digitsAfterDecimal: 3,
		xAxisLabelWidth: 75,
		axisTickSize: 5,
		yAxisLabelWidth: 100, /* Sync with CSS dyraph-label#text-indent */
		xRangePad: 25.0,
		yRangePad: 25.0,
		labelsSeparateLines: true,
		legend: 'always',
		axes: {
			x: {
				axisLabelFormatter: function (val) {
					return Math.exp(val).toFixed(3);
				},
				valueFormatter: function (val) {
					return 'Spectral Response Acceleration: ' +
							Math.exp(val).toFixed(3);
				}
			}
		}
	};

	var COLORS = [
		['#FF0000'],
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
		    i = null, numIters = iterations.length, iter = null,
		    hazardAnnotations = null;
		
		for (i = 0; i < numIters; i++) {
			labels.push('Iteration ' + (i+1));
			iter = iterations[i];
			pdf.push(iter.pdf);
			cdf.push(iter.cdf);
			integrand.push(iter.integrand);
			risk.push(iter.integral);
		}

		labels[labels.length - 1] = 'Final Iteration';

		this._renderGraph(this._cdfGraphOutput, sa, cdf, {
			title: 'Fragility Curves',
			ylabel: 'Conditional Collapse Probability',
			colors: colors,
			labels: labels,
			axes: {
				x: GRAPH_DEFAULTS.axes.x,
				y: {
					axisLabelFormatter: function (val) {
						return val.toFixed(2);
					}
				}
			},
			underlayCallback: function (context, area, dygraph) {
				var y = dygraph.toDomYCoord(0.1),
				    left = dygraph.toDomXCoord(Math.log(sa[0])),
				    right = dygraph.toDomXCoord(Math.log(sa[sa.length - 1])),
				    top = dygraph.toDomYCoord(1.0),
				    bottom = dygraph.toDomYCoord(0.0),
				    populateAnnotations = false;

				if (hazardAnnotations === null) {
					populateAnnotations = true;
					hazardAnnotations = [];
				}

				drawLine([left, y], [right, y], context, '#666', 0.5);
				context.textAlign = 'right';
				context.fillText('Target Risk', right, y - 5);

				for (var i = 0; i < cdf.length; i++) {
					var x = getIntersection(sa, cdf[i], 0.1);

					if (populateAnnotations) {
						hazardAnnotations.push(x);
					}

					x = dygraph.toDomXCoord(Math.log(x));
					drawLine([x, top], [x, bottom], context, colors[i], 0.25);
				}
			}
		});

		// Must do this after the CDF graph, so we know where annotations go
		this._renderHazardGraph(originalMin, originalMax, sa, afe,
				hazardAnnotations);

		this._renderGraph(this._pdfGraphOutput, sa, pdf, {
			title: 'Derivative of Fragility Curves',
			ylabel: 'Conditional Collapse Probability Density',
			colors: colors,
			labels: labels,
			axes: {
				x: GRAPH_DEFAULTS.axes.x,
				y: {
					axisLabelFormatter: function (val) {
						return val.toFixed(2);
					}
				}
			}
		});
		this._renderGraph(this._integrandGraphOutput, sa, integrand, {
			title: 'Hazard Curve &times; Derivative of Fragility Curves',
			ylabel: 'Annual Collapse Frequency Density',
			colors: colors,
			labels: labels,
			axes: {
				x: GRAPH_DEFAULTS.axes.x,
				y: {
					axisLabelFormatter: sciNote,
					valueFormatter: function (val) {
						return sciNote(val);
					}
				}
			}
		});
		this._renderGraph(this._riskGraphOutput, sa, risk, {
			title: 'Cumulative Integral of Hazard Curve &times; Derivative of ' +
					'Fragility Curves',
			ylabel: 'Cumulative 50-Year Collapse Probability',
			colors: colors,
			labels: labels,
			axes: {
				x: GRAPH_DEFAULTS.axes.x,
				y: {
					axisLabelFormatter: sciNote,
					valueFormatter: function (val) {
						return sciNote(val);
					}
				}
			},
			ymutatefn: function (val) {
				return 1 - Math.exp(-1.0 * val * 50);
			},
			underlayCallback: function (context, area, dygraph) {
				var y = dygraph.toDomYCoord(0.01),
				    left = dygraph.toDomXCoord(Math.log(sa[0])),
				    right = dygraph.toDomXCoord(Math.log(sa[sa.length - 1]));

				drawLine([left, y], [right, y], context, '#666', 0.5);
				context.textAlign = 'right';
				context.fillText('1% Probability of Collapse', right, y - 5);
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
				yvals, annotations) {
		var dataStr = [], oMinIdx = 0, oMaxIdx = xvals.length,
		    i = null, numVals = xvals.length;

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
			GRAPH_DEFAULTS, {
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
					axisLabelFormatter: function (val) {
						return sciNote(Math.exp(val), true);
					},
					valueFormatter: function (val) {
						return sciNote(Math.exp(val));
					}
				}
			}),
			underlayCallback: function (context, area, dygraph) {
				var y = dygraph.toDomYCoord(Math.log(0.0004)),
				    xmin = dygraph.toDomXCoord(Math.log(xvals[0])),
				    xmax = dygraph.toDomXCoord(Math.log(xvals[xvals.length - 1])),
				    top = dygraph.toDomYCoord(Math.log(yvals[numVals - 1])),
				    bottom = dygraph.toDomYCoord(Math.log(yvals[0])),
				    i = 0, xAnnotation, colors = COLORS[annotations.length - 1];

				// AFE4UHGM
				drawLine([xmin, y], [xmax, y], context, '#666', 0.5);
				context.textAlign = 'right';
				context.fillText('AFE4UHGM', xmax, y - 5);

				for (; i < annotations.length; i++) {
					xAnnotation = dygraph.toDomXCoord(Math.log(annotations[i]));
					drawLine([xAnnotation, top], [xAnnotation, bottom], context,
							colors[i], 0.25);
				}
			},
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
