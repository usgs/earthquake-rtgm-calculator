<?php


?>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
	<title>Risk Targeted Ground Motion Calculator</title>
	<meta name="description" content=""/>
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0"/>

	<!-- Stylesheets go here -->
	<link rel="stylesheet" href="css/index.css">
</head>
<body>
	<h1>Risk Targeted Ground Motion Calculator</h1>
	<p>
		X and Y values are placed in the URL after Service with a / separating each followed by any callback name. Example
		
		http://localhost:8080/service/X0,X1,X2,X3,X4/Y0,Y1,Y2,Y3,Y4/CallbackName

		Status: 200 = Request has succeeded
			400 = X and Y values must be specified and/or X and Y must be the same size.

		rtgm: ( Risk Target Ground Motion )

		uhgm: ( Uniform Hazard Ground Motion )

		riskCoefficient: ( rtgm / uhgm )

		upsampleHazardCurve: Hazard Curves
			xs: Spectral Response Acceleration
			ys: Annual Frequency of exceedance
		
		Derivative of Fragility Curves
			X = Spectral Response Acceleration
			Y = (PDF) Conditional Collapse Probability Density

		Fragility curves
			X = Spectral Response Acceleration
			Y = (CDF) Conditional Collapse Probability

		Hazard Curve X Derivative of Fragility Curves
			X = Spectral Response Acceleration
			Y = (Integrand) Annual Collapse Frequency Density

		Cumulative Integral of Hazard Curve X Derivative of Fragility Curves
			X = Spectral Response Acceleration
			Y = (Integral) 50-Year Collapse Probability

		originalHCMin: Original Hazard Curve Minimum
		originalHCMax: Original Hazard Curve Maximum
		
	</p>
	<a href="documentation.php">Read our API documentation</a>
	<div id="application"></div>

	<!-- Javascripts go here -->
	<script src="requirejs/require.js" data-main="js/index.js"></script>
</body>
</html>
