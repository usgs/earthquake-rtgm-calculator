<?php

/**
 * Class for calculating risk-targeted ground motions (RTGM).
 * Implementation is an adaptation of Matlab codes provided by N. Luco. Class
 * supplies one static utility method to {@code create()} a new RTGM instance.
 * Invokation of {@code call()} triggers an iterative calculation of
 * risk-targeted ground motion based on a target risk and the hazard curve
 * supplied at construction, returning a reference to the {@code this} instance.
 * It can then be queried for stepwise and final results.
 */ 
class RTGM {

	// Target risk in terms of annual frequency
	const TARGET_RISK = -log(1 - 0.01) / 50;

	// Logarithmic standard deviation of fragility curve
	const BETA_DEFAULT = 0.6;
	private $beta = BETA_DEFAULT;

	/* Annual frequency of exceedance for Uniform-Hazard Ground Motion (UHGM)
	   UHGM is both denominator of risk coefficient and initial guess for RTGM
	   2% PE 50yrs */
	const AFE4UHGM = -log(1 - 0.02) / 50;

	// RTGM iteration limit
	const MAX_ITERATIONS = 6;

	// Resampling interval (used in log space)
	const UPSAMPLING_FACTOR = 1.05;

	// Minimum spectral acceleration used in resampling
	const MIN_SA = 0.001;

	// Tolerance when comparing calculated risk to target
	const TOLERANCE = 0.01;

	// Hazard curve data
//	private XY_Series hazCurve;
	private hazCurve;

	// Retreivables
	public riskCoeff = NAN;
	public rtgm = NAN;
	public rtgmIters = null;
	public riskIters = null;
	public sa = null;

	/**
	 * Creates a new RTGM calculation and result container for the supplied
	 * hazard curve. Users must call {@code call()} to initiate calculation of a
	 * risk-targeted ground motion that can be retreived using {@code get()}.
	 * 
	 * @param xs hazard curve x-values
	 * @param ys hazard curve y-values
	 * @param sa specifies the period of the supplied curve; if not {@code null}
	 *        a geoMean to maxHorizDir component conversion factor of 1.1 (for
	 *        0.2sec) or 1.3 (for 1sec) will be applied to the RTGM value
	 *        returned by {@code get()}
	 * @param beta the fragility curve standard deviation; if {@code null} the
	 *        default value, 0.6, is used
	 * @return an RTGM calculation and result container
	 */
	public function __construct ($xs, $ys, $sa=null, $beta=null) {
		$zeroPos = $this->firstZeroValue(ys);
		$this->hazCurve = new XY_Series();
//		$this->hazCurve.xs = (zeroPos < xs.length) ? copyOf(xs, zeroPos) : xs;
//		$this->hazCurve.ys = (zeroPos < ys.length) ? copyOf(ys, zeroPos) : ys;	
		if ($sa != null) {
			$this->sa = $sa;
		}
		if ($beta != null) {
			$this->beta = $beta;
		}
	}

	/* 
	 * Returns the index of the first zero-valued data point. This method is
	 * used to check the tails of hazard curves that often have zero-valued
	 * rates. This could be updated to check for very low values instead, as
	 * some hazard curve generating software could supply "near-zero" values
	 * in lieu of actual zeros. Method assumes that all subsequent values will 
	 * also be zero. Method also ensures that data will have at least 2 values.
	 */
	private function firstZeroValue($data) {
		for ($i = 0; i$ < count($data); $i++) {		
			if (abs($data[$i]) < 0.00001) {
				break;
			}
		}
		return $i;
	}


}

?>
