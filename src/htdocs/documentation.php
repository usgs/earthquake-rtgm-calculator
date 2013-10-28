<?php
?>
<html>
	<p>
		<h2>Risk Targeted Ground Motion - API Documentation</h2>
<ul>
	<li>X and Y values are placed in the URL after Service with a /
		 separating each followed by any callback name. Example
	<ul>
		<li>http://localhost:8080/service/X0,X1,X2,X3,X4/Y0,Y1,Y2,Y3,Y4/CallbackName
	</ul>
</ul>
<ul>
	<li>Callback Name
	<ul>
		<li>Names the callback
	</ul>
</ul>
<ul>
	<li>Status
	<ul>
		<li>200 = Request has succeeded
		<li>400 = X and Y values must be specified and/or X and Y must be the same size.
	</ul>
</ul>
<ul>
	<li>RTGM
	<ul>
		<li>Risk Target Ground Motion
	</ul>
</ul>
<ul>
	<li>UHGM
	<ul>
		<li>Uniform Hazard Ground Motion
	</ul>
</ul>
<ul>
	<li>RiskCoefficient
	<ul>
		<li>RTGM divided by UHGM is equal to the Risk Coefficient  ( RTGM / UHGM = RiskCoefficient )
	</ul>
</ul>
<ul>
	<li>UpsampleHazardCurve: Hazard Curves
	<ul>
		<li>xs: Spectral Response Acceleration
		<li>ys: Annual Frequency of exceedance
	</ul>
</ul>
<ul>
	<li>Derivative of Fragility Curves
	<ul>
		<li>X = Spectral Response Acceleration
		<li>Y = (PDF) Conditional Collapse Probability Density
	</ul>
</ul>
<ul>
	<li>Fragility Curves
	<ul>
		<li>X = Spectral Response Acceleration
		<li>Y = (CDF) Conditional Collapse Probability
	</ul>
</ul>
<ul>
	<li>Hazard Curve X Derivative of Fragility Curves
	<ul>
		<li>X = Spectral Response Acceleration
		<li>Y = (Integrand) Annual Collapse Frequency Density
	</ul>
</ul>
<ul>
	<li>Cumulative Integral of Hazard Curve X Derivative of Fragility Curves
	<ul>
		<li>X = Spectral Response Acceleration
		<li>Y = (Integral) 50-Year Collapse Probability
	</ul>
</ul>
<ul>
	<li>originalHCMin: Original Hazard Curve Minimum
	<li>originalHCMax: Original Hazard Curve Maximum
</ul>
</p>
</html>
