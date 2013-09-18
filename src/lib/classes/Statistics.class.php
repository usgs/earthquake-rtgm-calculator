<?php

/**
 * Statistics utilities needed by the RTGM calculator that are not available
 * in standard PHP. Rewritten from the applicable code in:
 *
 * http://commons.apache.org/proper/commons-math/javadocs/api-3.2/index.html
 *
 * See api for algorthim details.
 */ 
class Statistics {

	// invGamma1pm1 constants
	const INV_GAMMA1P_M1_A0 = .611609510448141581788E-08;
	const INV_GAMMA1P_M1_A1 = .624730830116465516210E-08;
	const INV_GAMMA1P_M1_B1 = .203610414066806987300E+00;
	const INV_GAMMA1P_M1_B2 = .266205348428949217746E-01;
	const INV_GAMMA1P_M1_B3 = .493944979382446875238E-03;
	const INV_GAMMA1P_M1_B4 = -.851419432440314906588E-05;
	const INV_GAMMA1P_M1_B5 = -.643045481779353022248E-05;
	const INV_GAMMA1P_M1_B6 = .992641840672773722196E-06;
	const INV_GAMMA1P_M1_B7 = -.607761895722825260739E-07;
	const INV_GAMMA1P_M1_B8 = .195755836614639731882E-09;
	const INV_GAMMA1P_M1_P0 = .6116095104481415817861E-08;
	const INV_GAMMA1P_M1_P1 = .6871674113067198736152E-08;
	const INV_GAMMA1P_M1_P2 = .6820161668496170657918E-09;
	const INV_GAMMA1P_M1_P3 = .4686843322948848031080E-10;
	const INV_GAMMA1P_M1_P4 = .1572833027710446286995E-11;
	const INV_GAMMA1P_M1_P5 = -.1249441572276366213222E-12;
	const INV_GAMMA1P_M1_P6 = .4343529937408594255178E-14;
	const INV_GAMMA1P_M1_Q1 = .3056961078365221025009E+00;
	const INV_GAMMA1P_M1_Q2 = .5464213086042296536016E-01;
	const INV_GAMMA1P_M1_Q3 = .4956830093825887312020E-02;
	const INV_GAMMA1P_M1_Q4 = .2692369466186361192876E-03;
	const INV_GAMMA1P_M1_C = -.422784335098467139393487909917598E+00;
	const INV_GAMMA1P_M1_C0 = .577215664901532860606512090082402E+00;
	const INV_GAMMA1P_M1_C1 = -.655878071520253881077019515145390E+00;
	const INV_GAMMA1P_M1_C2 = -.420026350340952355290039348754298E-01;
	const INV_GAMMA1P_M1_C3 = .166538611382291489501700795102105E+00;
	const INV_GAMMA1P_M1_C4 = -.421977345555443367482083012891874E-01;
	const INV_GAMMA1P_M1_C5 = -.962197152787697356211492167234820E-02;
	const INV_GAMMA1P_M1_C6 = .721894324666309954239501034044657E-02;
	const INV_GAMMA1P_M1_C7 = -.116516759185906511211397108401839E-02;
	const INV_GAMMA1P_M1_C8 = -.215241674114950972815729963053648E-03;
	const INV_GAMMA1P_M1_C9 = .128050282388116186153198626328164E-03;
	const INV_GAMMA1P_M1_C10 = -.201348547807882386556893914210218E-04;
	const INV_GAMMA1P_M1_C11 = -.125049348214267065734535947383309E-05;
	const INV_GAMMA1P_M1_C12 = .113302723198169588237412962033074E-05;
	const INV_GAMMA1P_M1_C13 = -.205633841697760710345015413002057E-06;

	/**
	 * Returns the standard error function.
	*/
	public static function erf ($x) {
		if (abs($x) > 40) {
			return $x > 0 ? 1 : -1;
		}
		$ret = Statistics::regularizedGammaP(0.5, $x * $x, 1.0e-15, 10000);
		return $x < 0 ? -$ret : $ret;
	}

	/**
	 * Returns the inverse standard error function.
	*/
	public static function erfInv ($x) {

		// beware that the logarithm argument must be
		// commputed as (1.0 - x) * (1.0 + x),
		// it must NOT be simplified as 1.0 - x * x as this
		// would induce rounding errors near the boundaries +/-1
		$w = -log((1.0 - $x) * (1.0 + $x));
		$p;

		if ($w < 6.25) {
			$w = $w - 3.125;
			$p = -3.6444120640178196996e-21;
			$p = -1.685059138182016589e-19 + $p * $w;
			$p = 1.2858480715256400167e-18 + $p * $w;
			$p = 1.115787767802518096e-17 + $p * $w;
			$p = -1.333171662854620906e-16 + $p * $w;
			$p = 2.0972767875968561637e-17 + $p * $w;
			$p = 6.6376381343583238325e-15 + $p * $w;
			$p = -4.0545662729752068639e-14 + $p * $w;
			$p = -8.1519341976054721522e-14 + $p * $w;
			$p = 2.6335093153082322977e-12 + $p * $w;
			$p = -1.2975133253453532498e-11 + $p * $w;
			$p = -5.4154120542946279317e-11 + $p * $w;
			$p = 1.051212273321532285e-09 + $p * $w;
			$p = -4.1126339803469836976e-09 + $p * $w;
			$p = -2.9070369957882005086e-08 + $p * $w;
			$p =  4.2347877827932403518e-07 + $p * $w;
			$p = -1.3654692000834678645e-06 + $p * $w;
			$p = -1.3882523362786468719e-05 + $p * $w;
			$p = 0.0001867342080340571352 + $p * $w;
			$p = -0.00074070253416626697512 + $p * $w;
			$p = -0.0060336708714301490533 + $p * $w;
			$p = 0.24015818242558961693 + $p * $w;
			$p = 1.6536545626831027356 + $p * $w;
		} else if ($w < 16.0) {
			$w = sqrt($w) - 3.25;
			$p = 2.2137376921775787049e-09;
			$p = 9.0756561938885390979e-08 + $p * w;
			$p = -2.7517406297064545428e-07 + $p * $w;
			$p = 1.8239629214389227755e-08 + $p * $w;
			$p = 1.5027403968909827627e-06 + $p * $w;
			$p = -4.013867526981545969e-06 + $p * $w;
			$p = 2.9234449089955446044e-06 + $p * $w;
			$p = 1.2475304481671778723e-05 + $p * $w;
			$p = -4.7318229009055733981e-05 + $p * $w;
			$p = 6.8284851459573175448e-05 + $p * $w;
			$p = 2.4031110387097893999e-05 + $p * $w;
			$p = -0.0003550375203628474796 + $p * $w;
			$p = 0.00095328937973738049703 + $p * $w;
			$p = -0.0016882755560235047313 + $p * $w;
			$p = 0.0024914420961078508066 + $p * $w;
			$p = -0.0037512085075692412107 + $p * $w;
			$p = 0.005370914553590063617 + $p * $w;
			$p = 1.0052589676941592334 + $p * $w;
			$p = 3.0838856104922207635 + $p * $w;
		} else if (!is_infinite($w)) {
			$w = sqrt($w) - 5.0;
			$p = -2.7109920616438573243e-11;
			$p = -2.5556418169965252055e-10 + $p * $w;
			$p = 1.5076572693500548083e-09 + $p * $w;
			$p = -3.7894654401267369937e-09 + $p * $w;
			$p = 7.6157012080783393804e-09 + $p * $w;
			$p = -1.4960026627149240478e-08 + $p * $w;
			$p = 2.9147953450901080826e-08 + $p * $w;
			$p = -6.7711997758452339498e-08 + $p * $w;
			$p = 2.2900482228026654717e-07 + $p * $w;
			$p = -9.9298272942317002539e-07 + $p * $w;
			$p = 4.5260625972231537039e-06 + $p * $w;
			$p = -1.9681778105531670567e-05 + $p * $w;
			$p = 7.5995277030017761139e-05 + $p * $w;
			$p = -0.00021503011930044477347 + $p * $w;
			$p = -0.00013871931833623122026 + $p * $w;
			$p = 1.0103004648645343977 + $p * $w;
			$p = 4.8499064014085844221 + $p * $w;
		} else {
			// this branch does not appears in the original code, it
			// was added because the previous branch does not handle
			// x = +/-1 correctly. In this case, w is positive infinity
			// and as the first coefficient (-2.71e-11) is negative.
			// Once the first multiplication is done, p becomes negative
			// infinity and remains so throughout the polynomial evaluation.
			// So the branch above incorrectly returns negative infinity
			// instead of the correct positive infinity.
			$p = INF;
		}

		return $p * $x;
	}

	/**
	 * The inverse cumulative probablility of a normal (gaussian) distribution.
	*/
	public static function inverseCumulativeProbability ($p, $mean=0, $sd=1) {
		if ($p < 0.0 || $p > 1.0) {
			throw new Exception("Statistics::inverseCumulativeProbability: " .
					$p . " out of range: 0.0 to 1.0");
		}
		return $mean + $sd * sqrt(2.0) * Statistics::erfInv(2 * $p - 1);
	}

	/**
	 * Returns the value of 1 / gamma(1 + x) - 1 for -0.5 <= x <= 1.5.
	*/
	public static function invGamma1pm1 ($x) {
		if ($x < -0.5) {
			throw new Exception($x . " is smaller then the minimum -0.5");
		}
		if ($x > 1.5) {
			throw new Exception($x . " is larger then the maximum 1.5");
		}
		$ret;
		$t = $x <= 0.5 ? $x : ($x - 0.5) - 0.5;
		if ($t < 0.0) {
			$a = INV_GAMMA1P_M1_A0 + $t * INV_GAMMA1P_M1_A1;
			$b = INV_GAMMA1P_M1_B8;
			$b = INV_GAMMA1P_M1_B7 + $t * $b;
			$b = INV_GAMMA1P_M1_B6 + $t * $b;
			$b = INV_GAMMA1P_M1_B5 + $t * $b;
			$b = INV_GAMMA1P_M1_B4 + $t * $b;
			$b = INV_GAMMA1P_M1_B3 + $t * $b;
			$b = INV_GAMMA1P_M1_B2 + $t * $b;
			$b = INV_GAMMA1P_M1_B1 + $t * $b;
			$b = 1.0 + $t * $b;

			$c = INV_GAMMA1P_M1_C13 + $t * ($a / $b);
			$c = INV_GAMMA1P_M1_C12 + $t * $c;
			$c = INV_GAMMA1P_M1_C11 + $t * $c;
			$c = INV_GAMMA1P_M1_C10 + $t * $c;
			$c = INV_GAMMA1P_M1_C9 + $t * $c;
			$c = INV_GAMMA1P_M1_C8 + $t * $c;
			$c = INV_GAMMA1P_M1_C7 + $t * $c;
			$c = INV_GAMMA1P_M1_C6 + $t * $c;
			$c = INV_GAMMA1P_M1_C5 + $t * $c;
			$c = INV_GAMMA1P_M1_C4 + $t * $c;
			$c = INV_GAMMA1P_M1_C3 + $t * $c;
			$c = INV_GAMMA1P_M1_C2 + $t * $c;
			$c = INV_GAMMA1P_M1_C1 + $t * $c;
			$c = INV_GAMMA1P_M1_C + $t * $c;
			if ($x > 0.5) {
				$ret = $t * $c / $x;
			} else {
				$ret = $x * (($c + 0.5) + 0.5);
			}
		} else {
			$p = INV_GAMMA1P_M1_P6;
			$p = INV_GAMMA1P_M1_P5 + $t * $p;
			$p = INV_GAMMA1P_M1_P4 + $t * $p;
			$p = INV_GAMMA1P_M1_P3 + $t * $p;
			$p = INV_GAMMA1P_M1_P2 + $t * $p;
			$p = INV_GAMMA1P_M1_P1 + $t * $p;
			$p = INV_GAMMA1P_M1_P0 + $t * $p;

			$q = INV_GAMMA1P_M1_Q4;
			$q = INV_GAMMA1P_M1_Q3 + $t * $q;
			$q = INV_GAMMA1P_M1_Q2 + $t * $q;
			$q = INV_GAMMA1P_M1_Q1 + $t * $q;
			$q = 1.0 + $t * $q;

			$c = INV_GAMMA1P_M1_C13 + ($p / $q) * $t;
			$c = INV_GAMMA1P_M1_C12 + $t * $c;
			$c = INV_GAMMA1P_M1_C11 + $t * $c;
			$c = INV_GAMMA1P_M1_C10 + $t * $c;
			$c = INV_GAMMA1P_M1_C9 + $t * $c;
			$c = INV_GAMMA1P_M1_C8 + $t * $c;
			$c = INV_GAMMA1P_M1_C7 + $t * $c;
			$c = INV_GAMMA1P_M1_C6 + $t * $c;
			$c = INV_GAMMA1P_M1_C5 + $t * $c;
			$c = INV_GAMMA1P_M1_C4 + $t * $c;
			$c = INV_GAMMA1P_M1_C3 + $t * $c;
			$c = INV_GAMMA1P_M1_C2 + $t * $c;
			$c = INV_GAMMA1P_M1_C1 + $t * $c;
			$c = INV_GAMMA1P_M1_C0 + $t * $c;

			if ($x > 0.5) {
				$ret = ($t / $x) * (($c - 0.5) - 0.5);
			} else {
				$ret = $x * $c;
			}
		}

		return $ret;
	}

	/**
	 * Returns the Lanczos approximation used to compute the gamma function.
	*/
	public static function lanczos ($x) {
		$sum = 0.0;
		// Lanczos coefficients
		$lanczos = array(0.99999999999999709182,
				57.156235665862923517,
				-59.597960355475491248,
				14.136097974741747174,
				-0.49191381609762019978,
				.33994649984811888699e-4,
				.46523628927048575665e-4,
				-.98374475304879564677e-4,
				.15808870322491248884e-3,
				-.21026444172410488319e-3,
				.21743961811521264320e-3,
				-.16431810653676389022e-3,
				.84418223983852743293e-4,
				-.26190838401581408670e-4,
				.36899182659531622704e-5);

		for ($i = count($lanczos) - 1; $i > 0; --$i) {
			$sum = $sum + ($lanczos[$i] / ($x + $i));
		}
		return $sum + $lanczos[0];	
	}

	/**
	 * Returns the value of log gamma(x) for x > 0.
	*/
	public static function logGamma ($x) {
		$ret;
		$half_log_2_pi = 0.5 * log(2.0 * M_PI);
		$lanczos_g = 607.0 / 128.0;
		if (is_nan($x) || ($x <= 0.0)) {
			$ret = NAN;
		} else if ($x < 0.5) {
			return Statistics::logGamma1p($x) - log($x);
		} else if ($x <= 2.5) {
			return Statistics::logGamma1p(($x - 0.5) - 0.5);
		} else if ($x <= 8.0) {
			$n = intval(floor($x - 1.5));
			$prod = 1.0;
			for ($i = 1; $i <= $n; $i++) {
			$prod = $prod * (x - i);
			}
			return Statistics::logGamma1p($x - ($n + 1)) + log($prod);
		} else {
			$sum = Statistics::lanczos($x);
			$tmp = $x + $lanczos_g + .5;
			$ret = (($x + .5) * log($tmp)) - $tmp +
				$half_log_2_pi + log($sum / $x);
		}
		return $ret;
	}

	/**
	 * Returns the value of log gamma(1 + x) for -0.5 <= x <= 1.5.
	*/
	public static function logGamma1p ($x) {
		if ($x < -0.5) {
			throw new Exception($x . " is smaller then the minimum -0.5");
		}
		if ($x > 1.5) {
			throw new Exception($x . " is larger then the maximum 1.5");
		}
		return log1p(Statistics::invGamma1pm1($x));
	}

	/**
	 * Returns the regularized gamma function P(a, x).
	 */
	public static function regularizedGammaP ($a, $x, $epsilon,
		$maxIterations) {
		$ret;
		if (isNAN($a) || isNAN($x) || ($a <= 0.0) || ($x < 0.0)) {
			$ret = NAN;
		} else if ($x == 0.0) {
			$ret = 0.0;
		} else if ($x >= $a + 1) {
			// use regularizedGammaQ because it should converge faster in this
			// case.
			$ret = 1.0 - Statistics::regularizedGammaQ($a, $x, $epsilon,
					$maxIterations);
		} else {
			// calculate series
			$n = 0.0; // current element index
			$an = 1.0 / $a; // n-th element in the series
			$sum = $an; // partial sum
			while (abs($an/$sum) > $epsilon && $n < $maxIterations && 
					$sum < INF) {
				// compute next element in the series
				$n = $n + 1.0;
				$an = $an * ($x / ($a + $n));

				// update partial sum
				$sum = $sum + $an;
			}
			if ($n >= $maxIterations) {
				throw new Exception("Statistics::reqularizedGammaP: " .
						"max # iterations reached: " . $maxIterations);
			} else if (is_infinite($sum)) {
				$ret = 1.0;
			} else {
				$ret = exp(-$x + ($a * log($x)) - Statistics::logGamma($a)) * $sum;
			}
		}

		return ret;
	}

	/**
	 * Returns the regularized gamma function Q(a, x) = 1 - P(a, x).
	*/
	public static function regularizedGammaQ ($a, $x, $epsilon,
		$maxIterations) {
		if (is_nan($a) || is_nan($x) || ($a <= 0.0) || ($x < 0.0)) {
			$ret = NAN;
		} else if ($x == 0.0) {
			$ret = 1.0;
		} else if ($x < $a + 1.0) {
			// use regularizedGammaP because it should converge faster in this
			// case.
			$ret = 1.0 - Statistics::regularizedGammaP($a, $x, $epsilon,
					$maxIterations);
		} else {
			$ret = 1.0 / Statistics::cfEvaluate($a, $x, $epsilon,
					$maxIterations);
			$ret = exp(-$x + ($a * log($x)) - Statistics::logGamma($a)) * $ret;
		}
		return $ret;
	}

	/**
	 * Evaluates the continued fraction at the value x. (Specific to the 
	 * regularizedGammaQ function.)
	*/
	private static function cfEvaluate ($a, $x, $epsilon, $maxIterations) {
		$small = 1e-50;
		$hPrev = Statistics::getA($a, 0, $x);
		// use the value of small as epsilon criteria for zero checks
		if (abs($hPrev) <= $small) {
			$hPrev = $small;
		}

		$n = 1;
		$dPrev = 0.0;
		$cPrev = $hPrev;
		$hN = $hPrev;

		while ($n < $maxIterations) {
			$a1 = Statistics::getA($a, $n, $x);
			$b1 = Statistics::getB($a, $n);

			$dN = $a + $b * $dPrev;
			if (abs($dN) <= $small) {
				$dN = $small;
			}
			$cN = $a + $b / $cPrev;
			if (abs($cN) <= $small) {
				$cN = $small;
			}

			$dN = 1 / $dN;
			$deltaN = $cN * $dN;
			$hN = $hPrev * $deltaN;

			if (is_infinite($hN)) {
				throw new Exception("Continued fraction convergents diverged " .
						"to +/- infinity for value " . $x);
			}
			if (is_NAN($hN)) {
				throw new Exception("Continued fraction convergents diverged " .
						"to NaN for value " . $x);
			}

			if (abs($deltaN - 1.0) < $epsilon) {
				break;
			}

			$dPrev = $dN;
			$cPrev = $cN;
			$hPrev = $hN;
			$n++;
		}

		if ($n >= $maxIterations) {
			throw new Exception("Statistics::cfEvaluate: max # iterations " .
					"reached:" . $maxIterations);
		}

		return $hN;
	}

	/**
	 * Access the n-th a coefficient of the continued fraction. (Specific to
	 * regularizedGammaQ function).
	*/
	private static function getA ($a, $n, $x) {
		return ((2.0 * $n) + 1.0) - $a + $x;
	}

	/**
	 * Access the n-th b coefficient of the continued fraction. (Specific to
	 * regularizedGammaQ function).
	*/
	private static function getB ($a, $n) {
		return $n * ($a - $n); 
	}
}

?>
