<?php

/**
 * Static utilities for use by the RTGM calculator.
 */
class RTGM_Util {

	const MAX_SEQ_LEN = 10001;

	/**
	 * Binary search function based on java's Arrays.binarySearch.
	 *
	 * Parameters:
	 *   $a - The sort array.
	 *   $key - The key to be searched for.
	 *
	 * Return:
	 *    Index of the search key, if it is contained in the array within the
	 *    specified range; otherwise, (-(insertion point) - 1). The insertion
	 *    point is defined as the point at which the key would be inserted
	 *    into the array: the index of the first element in the range greater
	 *    than the key, or toIndex if all elements in the range are less
	 *    than the specified key. Note that this guarantees that the return
	 *    value will be >= 0 if and only if the key is found.
	 */
	public static function binary_search ($a, $key) {
		$low = 0;
		$high = count($a) - 1;
		if ($key < 0.01) {
}
		while ($low <= $high) {
			$mid = intval(($high - $low) / 2) + $low;
			$midVal = $a[$mid];

			if ($midVal < $key) {
				$low = $mid + 1;
			} else if ($midVal > $key) {
 				$high = $mid - 1;
			} else {
				return $mid; // key found
			}
		}
		return -($low + 1);
	}

	/**
	 * Creates a sequence of values starting at {@code min} and ending at
	 *
	 * {@code max}, the log of which are evenly spaced.
	 * @param min sequence value
	 * @param max sequence value
	 * @param step sequence spacing
	 * @param ascending if {@code true}, descending if {@code false}
	 * @return a monotonically increasing or decreasing sequence where the log
	 *         of the values are evenly spaced
	 */
	public static function buildLogSequence ($min, $max,
			$step, $ascending) {
		$seq = RTGM_Util::buildSequence(log($min), log($max),
			log($step), $ascending);
		return RTGM_Util::exp($seq);
	}

	/**
	 * Creates a sequence of evenly spaced values starting at {@code min} and
	 * ending at {@code max}. If {@code (max - min) / step} is not integer
	 * valued, the last step in the sequence will be {@code &lt;step}.
	 * @param min sequence value
	 * @param max sequence value
	 * @param step sequence spacing
	 * @param ascending if {@code true}, descending if {@code false}
	 * @return a monotonically increasing or decreasing sequence of values
	 */
	public static function buildSequence ($min, $max, $step, $ascending) {
		// if passed in arguments are NaN, +Inf, or -Inf, and step <= 0,
		// then capacity [c] will end up 0 because (int) NaN = 0, or outside the
		// range 1:10000
		$c = intval(($max - $min) / $step);
		if ($c <= 0) {
			return;
		} else if ($c >= RTGM_Util::MAX_SEQ_LEN) {
			throw new Exception("RTGM_Util::buildSequence: max sequence " .
					"length reached: " . RTGM_Util::MAX_SEQ_LEN);
		}
		if ($ascending) {
			return RTGM_Util::makeSequence($min, $max, $step, $c + 2);
		}
		$descSeq = RTGM_Util::makeSequence(-$max, -$min, $step, $c + 2);
		return RTGM_Util::flip($descSeq);
	}

	/**
	 * Applies the exponential function to every element of the supplied
	 * {@code data}.
	 *
	 * <p><b>Note:</b> This method does not check for over/underflow.</p>
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static function exp (&$data) {
		$data = array_map(function ($d) {return exp($d);}, $data);
		return $data;
	}

	/**
	 * For finding prob. of exceedance on a hazard curve. To use standard
	 * interpolation methods requires reversing the supplied x and y values,
	 * and then supplying them as reversed arguments to findLogLogY.
	 * This satisfies the monotonically increasing requirements of x and y
	 * data.
	 *
	 * @return the log-interpolated
	 */
	public static function findLogLogX ($xs, $ys, $y) {
		$revXs = array_reverse($xs);
		$revYs = array_reverse($ys);
		return RTGM_Util::findLogLogY($revYs, $revXs, $y);
	}

	/**
	 * Returns the log-log interpolated or extrapolated y-value using the
	 * supplied x- and y-value arrays.
	 *
	 * @param xs x-values of some function
	 * @param ys y-values of some function
	 * @param x value at which to find y
	 * @return the log-log interpolated y-value
	 */
	public static function findLogLogY ($xs, $ys, $x) {
		$i = RTGM_Util::dataIndex($xs, $x);
		return exp(RTGM_Util::findY(log($xs[$i]), log($ys[$i]),
			log($xs[$i + 1]), log($ys[$i + 1]), log($x)));
	}

	/**
	 * Returns the log-log interpolated or extrapolated y-values using the
	 * supplied x- and y-value arrays.
	 *
	 * @param xs x-values of some function
	 * @param ys y-values of some function
	 * @param x value at which to find y
	 * @return the log-log interpolated y-values
	 */
	public static function findLogLogYArrays ($xs, $ys, $x) {
		for ($i = 0; $i < count($x); $i++) {
			$y[] = RTGM_Util::findLogLogY($xs, $ys, $x[$i]);
		}
		return $y;
	}

	/**
	 * Returns the interpolated or extrapolated y-value corresponding to the
	 * supplied x-value. If any supplied value is {@code NaN}, returned value
	 * will also be {@code NaN}. Method does not do any input validation such
	 * that if the supplied points are coincident or define a vertical line, the
	 * method may return {@code Infinity}, {@code -Infinity}, or {@code NaN}.
	 *
	 * @param x1 x-value of first point
	 * @param y1 y-value of first point
	 * @param x2 x-value of second point
	 * @param y2 y-value of second point
	 * @param x value at which to find y
	 * @return the interpolated y-value
	 */
	public static function findY ($x1, $y1, $x2, $y2, $x) {
		//fix dividing by zero
		//if (($x2 - $x1) <= 0){
		//	return 0;
		//}

		return $y1 + ($x - $x1) * ($y2 - $y1) / ($x2 - $x1);
	}

	/**
	 * Flips the sign of every element in the supplied {@code data}.
	 * @param data to operate on
	 * @return a reference to the data
	 */
	public static function flip(&$data) {
		return RTGM_Util::scale($data, -1);
	}

	public static function logNormalDensity ($x, $mean, $std) {
		if ($x <= 0) {
			return 0;
		}
		$x0 = log($x) - $mean;
		$x1 = $x0 / $std;
		return exp(-0.5 * $x1 * $x1) / ($std * sqrt(2.0 * M_PI) * $x);
	}

	public static function logNormalCumProb ($x, $mean, $std) {
		if ($x <= 0) {
			return 0;
		}
		$dev = log($x) - $mean;
		if (abs($dev) > 40 * $std) {
		//added $ to dev
			return $dev < 0 ? 0.0 : 1.0;
		}
		return 0.5 + 0.5 * Statistics::erf($dev / ($std * sqrt(2.0)));
	}

	/**
	 * Multiples the values of {@code data1} to {@code data2} and returns a
	 * reference to {@code data1}.
	 * @param data1
	 * @param data2
	 * @return a reference to {@code data1}
	 */
	public static function multiply(&$data1, $data2) {
		$data1 = array_map(function ($d1, $d2) {return $d1 * $d2;},
				$data1, $data2);
		return $data1;
	}

	public static function norminv ($p) {
		return Statistics::inverseCumulativeProbability($p);
	}

	/**
	 * Scales (multiplies) the elements of the supplied {@code data} in place
	 * by {@code value}.
	 *
	 * <p><b>Note:</b> This method does not check for over/underflow.</p>
	 * @param data to scale
	 * @param value to scale by
	 * @return a reference to the supplied data
	 */
	public static function scale (&$data, $value) {
		$data = array_map(function($d1) use($value) {return $d1 * $value;},
				$data);
		return $data;
	}

	/**
	 * Performs trapezoidal rule integration on the supplied discretized
	 * function.
	 * @param f function to integrate
	 * @return the integral
	 */
	public static function trapz ($xs, $ys) {
		$sum = 0;
		for ($i = 1; $i < count($xs); $i++) {
			$sum = $sum + ($xs[$i] - $xs[$i-1]) * ($ys[$i] + $ys[$i-1]);
		}
		return $sum * 0.5;
	}

	private static function dataIndex ($data, $value) {
		$i = RTGM_Util::binary_search($data, $value);
		// adjust index for low value (-1) and in-sequence insertion pt
		// Note: below works in java as expected but not in PHP
//		$i = ($i == -1) ? 0 : ($i < 0) ? -$i - 2 : $i;
		$i = ($i == -1) ? 0 : (($i < 0) ? -$i - 2 : $i);
		// adjust hi index to next to last index
		return ($i >= count($data) - 1) ? --$i : $i;
	}

	private static function makeSequence ($min, $max, $step, $capacity) {
		$seq = array();
		for ($val = $min; $val < $max; $val = $val + $step) {
			$seq[] = $val;
		}
		$seq[] = $max;
		return $seq;
	}

}

?>
