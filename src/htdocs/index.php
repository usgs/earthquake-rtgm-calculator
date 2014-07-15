<?php
if (!isset($TEMPLATE)) {
	$TITLE = 'Risk Targeted Ground Motion Calculator';
	$HEAD = '
		<link rel="stylesheet" href="css/index.css"/>
	';
	$FOOT = '
		<script src="js/index.js"></script>
	';
	include_once 'template.inc.php';
}
?>

<p class="intro">
	Web application for computing risk-targeted ground motion values. For help
	using this tool, or for guidance on programmatic data access, please read
	<a href="documentation.php">the documentation</a>.
</p>

<div id="application"></div>