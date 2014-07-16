<?php
if (!isset($TEMPLATE)) {
	$TITLE = 'Risk Targeted Ground Motion - API Documentation';
	$HEAD = '
		<link rel="stylesheet" href="css/documentation.css"/>
	';

	include_once '../conf/config.inc.php';

	$sa = implode(',', array(
		0.01,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1,1.1,1.2,1.4,1.7,2
	));

	$afe1 = implode(',', array(
		0.5696,0.088335,0.02925,0.01229725,0.00564925,0.00275075,0.001385175,
		0.000733875,0.0003984225,0.0002205625,0.0001235975,0.00006881825,
		0.0000382493775,0.0000113329875,0.00000134645,0.000000064884
	));

	$afe2 = implode(',', array(
		0.5739,0.09486,0.032775,0.0143475,0.00689675,0.00349925,0.001878025,
		0.0010358,0.00059415,0.00034517,0.0002041625,0.00012253,0.00007213325,
		0.000025567215,0.00000481976025,0.0000007196
	));

	$jsonRequest = 'http://' . $_SERVER['HTTP_HOST'] . $MOUNT_PATH . '/service/' .
			$sa . '/' . $afe1;

	$jsonpRequest = 'http://' . $_SERVER['HTTP_HOST'] . $MOUNT_PATH . '/service/' .
			$sa . '/' . $afe2 . '/processData';

	include_once 'template.inc.php';
}
?>

<p>
	This page describes the process for <a href="#input">creating a request</a>
	and also defines the terms used in the <a href="#output">response
	output</a>. Additionally some <a href="#examples">examples are provided</a> to
	help get you started.
</p>

<h2 id="input">Request API</h2>
<pre><?php
	print 'http://' . $_SERVER['HTTP_HOST'] . $MOUNT_PATH . '/service' .
			'/<a href="#input-xvals">x0,x1,...xN</a>' .
			'/<a href="#input-yvals">y0,y1,...yN</a>' .
			'[/<a href="#input-callback">callback</a>]';
?></pre>

<dl class="definitions" id="input-api-definitions">
	<dt id="input-xvals">x0,x1,...,xN</dt>
	<dd>
		Comma-separated (no spaces) list of spectral acceleration values for the
		hazard curve. Note: You must specify the same number of y-values and
		x-values.
	</dd>

	<dt id="input-yvals">y0,y1,...,yN</dt>
	<dd>
		Comma-separated (no spaces) list of annual frequency of exceedance values
		for the hazard curve. Note: You must specify the same number of y-values and
		x-values.
	</dd>

	<dt id="input-callback">callback</dt>
	<dd>
		<strong>Optional</strong>.
		If specified, the JSONP callback to call when the response is returned.
		This is useful for application developers. Note: If this parameter
		is specified, the response content-type header is changed from
		&ldquo;application/json&rdquo; to &ldquo;text/javascript&rdquo;
	</dd>
</dl>

<p class="disclaimer">
	Note: All input hazard curve data must be adjusted with max-direction factors
	by the user <em>before</em> using the data in this application.
</p>

<h2 id="output">Response API</h2>
<pre>
{
	status: <a href="#output-responsecode">Response Code</a>,
	rtgm: {
		rtgm: <a href="#output-rtgm">Risk-targeted Ground Motion</a>,
		uhgm: <a href="#output-uhgm">Uniform Hazard Ground Motion</a>,
		riskCoefficient: <a href="#output-riskCoefficient">Risk Coefficient</a>,
		upsampledHazardCurve: {
			xs: <a href="#output-hcxvals">Spectral Response Acceleration</a>,
			ys: <a href="#output-hcyvals">Annual Frequency of Exceedance</a>
		},
		iterations: [
			{
				cdf: <a href="#output-cdf">Conditional Collapse Probability</a>,
				pdf: <a href="#output-pdf">Conditional Collapse Frequency Density</a>,
				integrand: <a href="#output-integrand"
					>Annual Collapse Frequency Density</a>,
				integral: <a href="#output-integral"
						>50-Year Collapse Probability</a>
			}
			,&hellip;
		],
		originalHCMin: <a href="#output-hcmin">Minimum input SA value</a>,
		originalHCMax: <a href="#output-hcmax">Maximum input SA value</a>
	}
}
</pre>

<dl class="definitions" id="output-api-definitions">
	<dt id="output-responsecode">status</dt>
	<dd class="datatype">Integer</dd>
	<dd>
		The <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html"
		target="_blank">HTTP Response Code</a> for the request. A response of 200
		indicates a successful request. Any other response code indicates an error.
	</dd>

	<!-- TODO :: Describe this better. -->
	<dt id="output-rtgm">rtgm</dt>
	<dd class="datatype">Number</dd>
	<dd>Risk Target Ground Motion</dd>

	<!-- TODO :: Describe this better. -->
	<dt id="output-uhgm">uhgm</dt>
	<dd class="datatype">Number</dd>
	<dd>Uniform Hazard Ground Motion<dd>

	<dt id="output-riskCoefficient">riskCoefficient</dt>
	<dd class="datatype">Number</dd>
	<dd>
		RTGM divided by UHGM is equal to the Risk Coefficient
		(RTGM / UHGM = RiskCoefficient)
	</dd>

	<dt id="output-hcxvals">xs</dt>
	<dd class="datatype">Array of Numbers</dd>
	<dd>
		Spectral response acceleration values upsampled from the <a
		href="input-xvals">input x-values</a>. Upsampling may involve extrapolation
		at either (or both) end(s) of the hazard curve. Interpolated and
		extrapolated values are computed using linear interpolation in logarithmic
		space.
	</dd>
	
	<dt id="output-hcyvals">ys</dt>
	<dd class="datatype">Array of Numbers</dd>
	<dd>
		Annual frequency of exceedance values upsampled from the <a
		href="#input-yvals">input y-values</a>. Upsampling may involve extrapolation
		at either (or both) end(s) of the hazard curve. Interpolated and
		extrapolated values are computed using linear interpolation in logarithmic
		space.
	</dd>


	<!-- TODO :: Describe this better -->
	<dt id="output-cdf">cdf</dt>
	<dd class="datatype">Array of Numbers</dd>
	<dd>
		Conditional Collapse Probability.
		Data in this array correspond the the <a href="#output-xvals">upsampled
		hazard curve x-values</a>.
	</dd>

	<!-- TODO :: Describe this better -->
	<dt id="output-pdf">pdf</dt>
	<dd class="datatype">Array of Numbers</dd>
	<dd>
		Conditional Collapse Probability Density.
		Data in this array correspond the the <a href="#output-xvals">upsampled
		hazard curve x-values</a>.
	</dd>

	<!-- TODO :: Describe this better -->
	<dt id="output-integrand">integrand</dt>
	<dd class="datatype">Array of Numbers</dd>
	<dd>
		Annual Collapse Frequency Density.
		Data in this array correspond the the <a href="#output-xvals">upsampled
		hazard curve x-values</a>.
	</dd>

	<!-- TODO :: Describe this better -->
	<dt id="output-integral">integral</dt>
	<dd class="datatype">Array of Numbers</dd>
	<dd>
		50-Year Collapse Probability.
		Data in this array correspond the the <a href="#output-xvals">upsampled
		hazard curve x-values</a>.
	</dd>

	<dt id="output-hcmin">originalHCMin</dt>
	<dd class="datatype">Number</dd>
	<dd>
		The smallest input spectral response acceleration value. This is useful for
		determining if a resulting spectral acceleration value in the upsampled
		hazard curve is based on extrapolation.
	</dd>

	<dt id="output-hcmax">originalHCMax</dt>
	<dd class="datatype">Number</dd>
	<dd>
		The largest input spectral response acceleration value. This is useful for
		determining if a resulting spectral acceleration value in the upsampled
		hazard curve is based on extrapolation.
	</dd>
</dl>

<h3 id="examples">Examples</h3>
<ul class="examples">
	<li>
		Example 1: JSON request, no callback is specified. Note the content-type
		header in the response.<br/>
		<a href="<?php print $jsonRequest; ?>" target="_blank" class="examplelink"
				><?php print $jsonRequest; ?></a>
	</li>
	<li>
		Example 2: JSONP request, a callback is specified. Note the content-type
		header in the response. The response for this request is wrapped in the
		specified javascript callback.<br/>
		<a href="<?php print $jsonpRequest; ?>" target="_blank" class="examplelink"
				><?php print $jsonpRequest; ?></a>
	</li>
</ul>
