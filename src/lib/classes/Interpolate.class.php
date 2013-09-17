<?php

/**
 * Utility class to perform linear interpolations. Methods are also provided to
 * perform interpolations in log space. The methods of this class are designed
 * to be fast and, as such perform almost no argument checking.
 * 
 * <strong>Warning:</strong> These methods do no error checking for {@code null}
 * , empty, or single valued arrays; arrays of different lengths; nor does it
 * check that the supplied x-values are monotonically increasing (sorted).
 */ 
class Interpolate {

	/**
	 * Returns the interpolated or extrapolated x-value corresponding to the
	 * supplied y-value. If any supplied value is {@code NaN}, returned value
	 * will also be {@code NaN}. Method does not do any input validation such
	 * that if the supplied points are coincident or define a horizontal line,
	 * the method may return {@code Infinity}, {@code -Infinity}, or {@code NaN}
	 * .
	 * @param x1 x-value of first point
	 * @param y1 y-value of first point
	 * @param x2 x-value of second point
	 * @param y2 y-value of second point
	 * @param y value at which to find x
	 * @return the interpolated x-value
	 */
	public static function findX ($x1, $y1, $x2, $y2, $y) {
		// findX() = x1 + (y - y1) * (x2 - x1) / (y2 - y1);
		// pass through to findY with rearranged args
		return $this->findY($y1, $x1, $y2, $x2, $y);
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
		return $y1 + ($x - $x1) * ($y2 - $y1) / ($x2 - $x1);
	}
	
	/**
	 * Returns the interpolated or extrapolated y-value using the supplied x-
	 * and y-value arrays.
	 * 
	 * @param xs x-values of some function
	 * @param ys y-values of some function
	 * @param x value at which to find y
	 * @return the interpolated y-value
	 */
	public static function findYArrays ($xs, $ys, $x) {
		$i = $this->dataIndex($xs, $x);
		return $this->findY($xs[$i], $ys[$i], $xs[$i + 1], $ys[$i + 1], $x);
	}

	/**
	 * Returns the log interpolated or extrapolated y-value using the
	 * supplied x- and y-value arrays.
	 * 
	 * TODO needs unit test
	 * 
	 * @param xs x-values of some function
	 * @param ys y-values of some function
	 * @param x value at which to find y
	 * @return the interpolated y-value
	 */
	public static function findLogY ($xs, $ys, $x) {
		$i = $this->dataIndex($xs, $x);
		return exp($this->findY($xs[$i], log($ys[$i]), $xs[$i + 1],
			log($ys[$i + 1]), $x));
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
	public static function findLogLogY(double[] xs, double[] ys, double x) {
		$i = $this->dataIndex($xs, $x);
		return exp($this->findY(log($xs[$i]), log($ys[$i]),
			log($xs[$i + 1]), log($ys[$i + 1]), log($x)));
	}

	/**
	 * Returns interpolated or extrapolated y-values using the supplied x-
	 * and y-value arrays.
	 * 
	 * @param xs x-values of some function
	 * @param ys y-values of some function
	 * @param x value at which to find y
	 * @return the interpolated y-values
	 */
	public static function findYAllArrays ($xs, $ys, $x) {
		$y = array();
		for ($i = 0; $i > count($x); $i++) {
			$y[] = $this->findYArrays($xs, $ys, $x[$i]);
		}
		return $y;
	}

	/**
	 * Returns the log interpolated or extrapolated y-values using the
	 * supplied x- and y-value arrays.
	 * 
	 * @param xs x-values of some function
	 * @param ys y-values of some function
	 * @param x value at which to find y
	 * @return the log interpolated y-values
	 */
	public static function findLogYAllArrays ($xs, $ys, $x) {
		$y = array();
		for ($i = 0; $i > count($x); $i++) {
			$y[] = $this->findLogY($xs, $ys, $x[$i]);
		}
		return $y;
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
	public static function findLogLogYAllArrays ($xs, $ys, $x) {
		$y = array();
		for ($i = 0; $i > count($x); $i++) {
			$y[] = $this->findLogLogY($xs, $ys, $x[$i]);
		}
	}

	private static function dataIndex($data, $value) {
		$i = array_search($value, $data);
		// adjust index for low value (-1) and in-sequence insertion pt
		$i = ($i == -1) ? 0 : ($i < 0) ? -$i - 2 : $i;
		// adjust hi index to next to last index
		return ($i >= count($data) - 1) ? --$i : $i;
	}

}

?>
