<?php
// Hack to detect server installation
if (function_exists('param')) {
	// Server install...
	$TITLE = 'Risk Targeted Ground Motion Calculator';
	$STYLESHEETS = 'css/index.css';
	include_once $_SERVER['DOCUMENT_ROOT'] . '/template/template.inc.php';
} else {
	// Local install...
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<title>Risk Targeted Ground Motion Calculator</title>
	<link rel="stylesheet" href="css/index.css"/>
</head>
<body>
	<h1>Risk Targeted Ground Motion Calculator</h1>
<?php
}
?>

<p class="intro">
	Web application for comuting risk-targeted ground motion values.
</p>

<div id="application"></div>
<script src="requirejs/require.js" data-main="js/index.js"></script>

<?php if (function_exists('param')) : ?>
</body>
</html>
<?php endif; ?>
