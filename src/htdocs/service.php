<?php
	include_once '../conf/config.inc.php';

	if (!function_exists('jsonResponse')) {
		function jsonResponse ($response, $callback = null) {
			if ($callback != null) {
				header('Content-Type: text/javascript');
				print $callback . '(';
			} else {
				header('Content-Type: application/json');
			}

			print str_replace('\/', '/', json_encode($response));

			if ($callback != null) {
				print ');';
			}
		}
	}

	$callback = null;
	if (isset($_GET['c'])) {
		$callback = stripslashes($_GET['c']);
	}

	if (!isset($_GET['x']) || !isset($_GET['y'])) {
		// Error, must have x and y values
		jsonResponse(array(
			'error' => 'Spectral Acceleration and Annual Frequency of Exceedance ' +
			           'values must both be specified.',
			'status' => 400
			), $callback);
		exit();
	}

	// Read parameters
	$xparam = explode(',', urldecode($_GET['x']));
	$yparam = explode(',', urldecode($_GET['y']));

	// Parse parameters to floats (very basic input cleansing)
	foreach ($xparam as $x) {
		$xs[] = floatval($x);
	}
	foreach ($yparam as $y) {
		$ys[] = floatval($y);
	}

	// Basic input validation
	if (sizeof($xs) != sizeof($ys)) {
		jsonResponse(array(
			'error' => 'Spectral Acceleration and Annual Frequency of Exceedance ' +
			           'values must be the same size.',
			'status' => 400
			), $callback);
		exit();
	}

	// TODO :: (Future) Add Period or Beta values to this? For now we assume
	//         input data is already max-direction and use default 0.6 beta value.
	$rtgm = new RTGM($xs, $ys);
	$rtgm->calculate();

	// JSON output
	jsonResponse(array(
		'status' => 200,
		'rtgm' => $rtgm->getStructure()
	), $callback);

	// CSV-style output better for pasting into spreadsheets
	// $s = $rtgm->getStructure();
	// print 'sa,' . implode(',', $s['upsampledHazardCurve']->xs) . "\n";
	// print 'afe,' . implode(',', $s['upsampledHazardCurve']->ys) . "\n";

	// foreach ($s['iterations'] as $i) {
	// 	print 'pdf,' . implode(',', $i['pdf']) . "\n";
	// 	print 'cdf,' . implode(',', $i['cdf']) . "\n";
	// 	print 'integrand,' . implode(',', $i['integrand']) . "\n";
	// 	print 'integral,' . implode(',', $i['integral']) . "\n";
	// }
?>
