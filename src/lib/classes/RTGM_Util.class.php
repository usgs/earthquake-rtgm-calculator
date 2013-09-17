<?php

/**
 * Static utilities for use by the RTGM calculator.
 */ 
class RTGM_Util {

	/**
	 * For finding prob. of exceedance on a hazard curve. To use standard
	 * interpolation methods requires reversing the supplied x and y values,
	 * and then supplying them as reversed arguments to Interpolate.findLogLogY.
	 * This satisfies the monotonically increasingrequirements of x and y
	 * data in Interpolate.
	 *
	 * @return the log-interpolated 
	 */
	public static function findLogLogX ($xs, $ys, $y) {
		$revXs = array_reverse($xs);
		$revYs = array_reverse($ys);
		return Interpolate::findLogLogY($revYs, $revXs, $y);
	}
	
	/**
	 * Performs trapezoidal rule integration on the supplied discretized
	 * function.
	 * @param f function to integrate
	 * @return the integral
	 */
	public static function trapz ($xs, $ys) {
		$sum = 0;
		for ($i = 1; $i < count($xs.length); $i++) {
			$sum = $sum + ($xs[$i] - $xs[$i-1]) * ($ys[$i] + $ys[$i-1]);
		}
		return $sum * 0.5;
	}

	public static function logNormalDensity ($x, $mean, $std) {
		if ($x <= 0) return 0;
		$x0 = log($x) - $mean;
		$x1 = $x0 / $std;
		return exp(-0.5 * $x1 * $x1) / ($std * sqrt(2.0 * M_PI) * $x);
	}

	public static function logNormalCumProb ($x, $mean, $std) {
		if ($x <= 0) return 0;
		$dev = log($x) - $mean;
		if (abs($dev) > 40 * $std) {
			return dev < 0 ? 0.0 : 1.0;
		}
		//	Need a php version of org.apache.commons.math3.special.Erf
		// return 0.5 + 0.5 * $this->erf($dev / ($std * sqrt(2.0)));
	}

	public static function norminv (double p) {
		try {
			// Need a php version of 
			// org.apache.commons.math3.distribution.NormalDistribution
			// return normDist.inverseCumulativeProbability(p);
		} catch (RuntimeException e) {
			e.printStackTrace();
			return NAN;
		}
	}

}

?>
