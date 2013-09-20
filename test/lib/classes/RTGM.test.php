<?php
	if (!function_exists('notify')) {
		function notify ($testName, $expectation, $actual) {
			$epsilon = 0.0000000001;
			if (gettype($actual) == "double") {
				$passed = abs($expectation - $actual) < $epsilon;
			}
			else if (gettype($actual) == "array") {
				$size = count($actual);
				if ($size != count($expectation)) {
					$passed = false;
				}
				else {
					$passed = true;
					for ($i=0; $i < $size; $i++) {
						$passed = abs($expectation[$i] - $actual[$i]) 
								< $epsilon;
						if (!$passed) break;
					}
				}
			}
			else {
				$passed = ($expectation == $actual);
			}

			printf("[%s] Running test '%s' %s\n",
				$passed ? 'Passed' : 'Failed',
				$testName,
				($passed) ? '' : sprintf("(Expected '%s' received '%s')",
						json_encode($expectation), json_encode($actual))
			);
		}
	}

	include_once '../../../src/conf/config.inc.php';

	try {
		// Define curves for global test
		$xs = array(0.0025, 0.00375, 0.00563, 0.00844, 0.0127, 0.019, 0.0285,
				0.0427, 0.0641, 0.0961, 0.144, 0.216, 0.324, 0.487, 0.73, 1.09,
				1.64, 2.46, 3.69, 5.54);
		$ys = array(0.4782, 0.3901, 0.3055, 0.2322, 0.1716, 0.1241, 0.08621,
				0.05687, 0.03492, 0.01985, 0.01045, 0.005095, 0.002302,
				0.0009371, 0.0003308, 9.488e-05, 1.952e-05, 2.174e-06, 
				8.553e-08, 1.315e-10);
				
		// What we expect back
		$riskCoeff = 0.9559509060952;
		$rtgmIters = array(0.67538571727694, 0.60742309988984, 
				0.64563558839465);
		$riskIters = array(0.89937214298651, 1.1544629679089,
				1.0007739262587);

		// Values for testing methods.
		$afe4uhgm = -log(1 - 0.02) / 50;
		$min_sa = 0.001;
		$rtgmTmp = 24.000128833913;
		$riskTmp = 0.0098381077878375;
		$target_risk = -log(1 - 0.01) / 50;
		$uhgm = 0.6753857172769;
		$usampling_factor = 1.05;

		$rtgm = new RTGM($xs, $ys, Frequency::SA_1P00, 0.8); 
		
		// RGTM_Util method tests
		$a = array(1.0, 3.0, 5.0, 7.0, 8.0, 9.0, 10.0);
		notify('Binary search found', 2, RTGM_Util::binary_search($a, 5.0));
		notify('Binary search not found', -4, RTGM_Util::binary_search
				($a, 6.0));
		notify('Build Sequence', 178, count(RTGM_Util::buildSequence
				(log($min_sa), log($xs[count($xs)-1]), log($usampling_factor),
				true)));
		notify('Build Sequence Inf/NaN', 0, count(RTGM_Util::buildSequence
				(INF, NAN, 1, true)));
		notify('Exp', array(2.718281828459,7.3890560989307,20.085536923188),
				RTGM_Util::exp(array(1, 2, 3)));
		notify('Find Log Log X', $uhgm,
				RTGM_Util::findLogLogX($rtgm->hazCurve->xs,
				$rtgm->hazCurve->ys, $afe4uhgm));
		notify('Find Log Log Y', $rtgmTmp, 
				RTGM_Util::findLogLogY($riskIters, $rtgmIters, $target_risk));
		notify('Log Normal Cumulative Prob', 0.040507341811011, 
				RTGM_Util::logNormalCumProb(1.3, 1.6, 0.6));
		notify('Log Normal Cumulative Prob (0)', 0.0, 
				RTGM_Util::logNormalCumProb(0.0, 1.6, 0.6));
		notify('Log Normal Density', 0.042613954514149, 
				RTGM_Util::logNormalDensity(1.3, 1.6, 0.6));
		notify('Log Normal Density (0)', 0.0, 
				RTGM_Util::logNormalDensity(0.0, 1.6, 0.6));
		notify('Multiply', array(3, 8, 15), RTGM_Util::multiply(array(1, 2, 3),
				array(3, 4, 5)));
		notify('Scale', array(1, 2, 3), RTGM_Util::scale(array(10, 20, 30),.1));
		notify('Trapz', $riskTmp, RTGM_Util::trapz($xs, $ys));

		// Statistics method tests
		notify('ErfInv', 0.47693627620447, Statistics::erfInv(0.5));
		notify('InverseCumulativeProbabilty', 0.67448975019608,
				Statistics::inverseCumulativeProbability(.75));
		notify('InverseCumulativeProbabilty (3 args)', 2.0046938501176,
				Statistics::inverseCumulativeProbability(.75, 1.6, 0.6));
		try {
			Statistics::inverseCumulativeProbability(2.5);
			notify('InverseCumulativeProbabilty out of range',
					"Exception thrown", "Ok");
		} catch (Exception $ex1) {
			notify('InverseCumulativeProbabilty out of range', $ex1, $ex1);
		}
		notify('InvGamma1pm1', 0.12837916709551, Statistics::invGamma1pm1(0.5));
		try {
			Statistics::invGamma1pm1(-2.5);
			notify('InvGamma1pm1 too small', "Exception thrown", "Ok");
		} catch (Exception $ex1) {
			notify('InvGamma1pm1 too small', $ex1, $ex1);
		}
		try {
			Statistics::invGamma1pm1(2.5);
			notify('InvGamma1pm1 too large', "Exception thrown", "Ok");
		} catch (Exception $ex1) {
			notify('InvGamma1pm1 too large', $ex1, $ex1);
		}
		notify('Lanczos', 19.194552097849, Statistics::lanczos(0.5));
		notify('LogGamma', -0.5723649429247, Statistics::logGamma(0.5));
		notify('RegularizedGammaP', 2.4483331241247,
				Statistics::regularizedGammaP(0.5, .75, 1.0e-15, 10000));
		notify('RegularizedGammaQ', 0.19279586278375,
				Statistics::regularizedGammaQ(0.5, 1.75, 1.0e-15, 10000));

		// Global test
		$rtgm->calculate();
		notify('Get risk coefficient', $riskCoeff, $rtgm->riskCoeff);
		notify('Get rtgm iter', $rtgmIters, $rtgm->rtgmIters);
		notify('Get risk iter', $riskIters, $rtgm->riskIters);
//		print json_encode($rtgm);
		printf ("riskCoeff: %s\n",json_encode($rtgm->riskCoeff));
		printf ("rtgmIters: %s\n",json_encode($rtgm->rtgmIters));
		printf ("riskIters: %s\n",json_encode($rtgm->riskIters));
	} catch (Exception $e) {
		print $e->getMessage() . "\n";
	}
?>

