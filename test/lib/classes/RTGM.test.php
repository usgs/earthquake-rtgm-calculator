<?php
	if (!function_exists('notify')) {
		function notify ($testName, $expectation, $actual) {
			$passed = ($expectation == $actual);

			printf("[%s] Running test '%s' %s\n",
				$passed ? 'Passed' : 'Failed',
				$testName,
				($passed) ? '' : sprintf("(Expected '%s' received '%s')",
						$expectation, $actual)
			);

		}
	}

	include_once '../../../src/conf/config.inc.php';

	try {
		$xs = array(0.0025,
				0.00375,
				0.00563,
				0.00844,
				0.0127,
				0.019,
				0.0285,
				0.0427,
				0.0641,
				0.0961,
				0.144,
				0.216,
				0.324,
				0.487,
				0.73,
				1.09,
				1.64,
				2.46,
				3.69,
				5.54);
		$ys = array(0.4782,
				0.3901,
				0.3055,
				0.2322,
				0.1716,
				0.1241,
				0.08621,
				0.05687,
				0.03492,
				0.01985,
				0.01045,
				0.005095,
				0.002302,
				0.0009371,
				0.0003308,
				9.488e-05,
				1.952e-05,
				2.174e-06,
				8.553e-08,
				1.315e-10);
		$rtgm = new RTGM($xs, $ys, Frequency::SA_1P00, 0.8); 
		print $rtgm->calculate();
	} catch (Exception $e) {
		print $e->getMessage() . "\n";
	}
?>

