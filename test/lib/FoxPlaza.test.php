<?php

/**
 * This test runs RTGM calculations on all the provided Fox Plaza hazard curves
 * (see foxplaza.csv). This test requires visual inspection and comparison
 * against current Matlab results. Output is printed in (hopefully) a readily
 * comparible format.
 *
 */
chdir(dirname(__FILE__));
include_once '../../src/conf/config.inc.php';

$contents = file('foxplaza.csv');
$saline = rtrim(array_shift($contents));
$xs = explode(',', $saline);
array_shift($xs); // Remove leading "SA" identifier

foreach ($contents as $line) {
	$ys = explode(',', rtrim($line));
	$period = array_shift($ys);

	$rtgm = new RTGM($xs, $ys);
	$rtgm->calculate();
	$result = $rtgm->getStructure();

	printf("%s\n%f\n%f\n%f\n\n", $period, $result['uhgm'],
			$result['riskCoefficient'], $result['rtgm']);
}
?>
