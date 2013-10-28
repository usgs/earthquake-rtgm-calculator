<?php
?>
<html>
<p>
	<h2>Risk Targeted Ground Motion - API Documentation</h2>
<dl>
	<dt>X and Y values are placed in the URL after Service with a /
		 separating each followed by any callback name. Example
		<dd>http://localhost:8080/service/X0,X1,X2,X3,X4/Y0,Y1,Y2,Y3,Y4/CallbackName
</dl>
<dl>
	<dt>Callback Name
		<dd>Names the callback
</dl>
<dl>
	<dt>Status
		<dd>200 = Request has succeeded
		<dd>400 = X and Y values must be specified and/or X and Y must be the same size.
</dl>
<dl>
	<dt>RTGM
		<dd>Risk Target Ground Motion
</dl>
<dl>
	<dt>UHGM
		<dd>Uniform Hazard Ground Motion
</dl>
<dl>
	<dt>RiskCoefficient
		<dd>RTGM divided by UHGM is equal to the Risk Coefficient  ( RTGM / UHGM = RiskCoefficient )
</dl>
<dl>
	<dt>UpsampleHazardCurve: Hazard Curves
		<dd>xs: Spectral Response Acceleration
		<dd>ys: Annual Frequency of exceedance
</dl>
<dl>
	<dt>Derivative of Fragility Curves
		<dd>X = Spectral Response Acceleration
		<dd>Y = (PDF) Conditional Collapse Probability Density
</dl>
<dl>
	<dt>Fragility Curves
		<dd>X = Spectral Response Acceleration
		<dd>Y = (CDF) Conditional Collapse Probability
</dl>
<dl>
	<dt>Hazard Curve X Derivative of Fragility Curves
		<dd>X = Spectral Response Acceleration
		<dd>Y = (Integrand) Annual Collapse Frequency Density
</dl>
<dl>
	<dt>Cumulative Integral of Hazard Curve X Derivative of Fragility Curves
		<dd>X = Spectral Response Acceleration
		<dd>Y = (Integral) 50-Year Collapse Probability
</dl>
<dl>
	<dt>originalHCMin: Original Hazard Curve Minimum
	<dt>originalHCMax: Original Hazard Curve Maximum
</dl>
</p>
</html>
