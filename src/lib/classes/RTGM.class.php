<?php

/**
 * Class for calculating risk-targeted ground motions (RTGM).
 * Implementation is an adaptation of Matlab codes provided by N. Luco.
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

	public hazCurve;
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
		if (zeroPos < xs.length) {
			$this->hazCurve->xs = array_slice($xs, 0, $zeroPos);
			$this->hazCurve->ys = array_slice($ys, 0, $zeroPos);
		}
		else {
			$this->hazCurve->xs = $xs;
			$this->hazCurve->ys = $ys;
		}
		if ($sa != null) {
			$this->sa = $sa;
		}
		if ($beta != null) {
			$this->beta = $beta;
		}
	}

	/**
	 * Returns the risk-targeted ground motion for the hazard curve supplied at
	 * creation.
	 * @return the risk targeted ground motion
	 */
	public function get () {
		// In the USGS seismic design maps, hazard curves are scaled by a
		// frequency dependent factor. If a frequency was supplied at creation,
		// the corresponding scale factor is applied here to the rtgm value.
		return ($sa != null) ? $rtgm * $sa->scale : $rtgm;
	}

	/**
	 * Maked the internal iterative RTGM calculation.
	 *
	 * @throws {Exception} 
	 *      if internal RTGM calculation exceeds the maximum iterations
	 */
	public function calculate () {

		// uniform hazard ground motion
		$uhgm = RTGM_Util::findLogLogX($this->hazCurve->xs, $this->hazCurve->ys,
				AFE4UHGM);

		$rtgmIters = array();
		$riskIters = array();

		// For adequate discretization of fragility curves...
		$upsampHazCurve = logResample($this->hazCurve, MIN_SA,
				UPSAMPLING_FACTOR);
		$errorRatio = NAN;

		// Iterative calculation of RTGM
		for ($i = 0; $i < $MAX_ITERATIONS; $i++) {

			$rtgmTmp;
			$riskTmp;

			if ($i == 0) {
				$rtgmTmp = $uhgm;
			} else if (i == 1) {
				$rtgmTmp = $rtgmIters[0] * $errorRatio;
			} else {
				$rtgmTmp = RGM_Utils::findLogLogY($riskIters, $rtgmIters,
						TARGET_RISK);
			}

			// Generate fragility curve corresponding to current guess for RTGM
			$fc = new FragilityCurve($rtgmTmp, $upsampHazCurve, $beta);

			/* Calculate risk using fragility curve generated above & upsampled
			   hazard curve. */
			$riskTmp = $this->riskIntegral($fc.pdf(), $upsampHazCurve);

			// Check risk calculated above against target risk
			$errorRatio = $this->checkRiskAgainstTarget($riskTmp);
			$riskIters[] = $riskTmp;
			$rtgmIters[] = $rtgmTmp;

			// Exit if ratio of calculated and target risks is within tolerance
			if ($errorRatio == 1) break;

			// If number of iterations has reached specified maximum, exit loop
			if ($i == MAX_ITERATIONS) {
				throw new Exception("RTGM: max # iterations reached");
			}
		}

		if ($errorRatio != 1) {
			$rtgm = NAN;
		}
		else {
			$rtgm = $rtgmIters[count($rtgmIters) - 1];
		}
		$riskCoeff = $rtgm / $uhgm;

		for ($j = 0; $j < count($riskIters); $j++) {
			$riskIters[$j] = $riskIters[$j] / TARGET_RISK;
		}
	}

	/* 
	 * Evaluates the Risk Integral.
	 *
	 * This method assumes that the fragility PDF is defined at the same
	 * spectral accelerations as the hazard curve (i.e. at HazardCurve.SAs).
	 */
	private function riskIntegral ($fragPDF, $hazCurve) {
		// multiply fragPDF in place
		$fragPDF->ys = DataUtils::multiply($fragPDF->ys, $hazCurve->ys); 
		return RTGM_Util::trapz($fragPDF->xs, $fragPDF->ys);
	}

	/* 
	 * Compares calculated risk to target risk; returns 1 if within tolerance.
	 */
	private function checkRiskAgainstTarget ($risk) {
		$er = $risk / TARGET_RISK; // error ratio
		return abs(er - 1) < TOLERANCE) ? 1 : er;
	}

	/* 
	 * Resamples hc with supplied interval over min to f.max.
	 */
	private function logResample ($in, $min, $interval) {
		$out = new XY_Series();
		$out->xs = DataUtils::buildLogSequence($min, $in->xs
				[count($in->xs -1)], $interval, true);
		$out->ys = Interpolate::findLogLogY($in->xs, $in->ys, $out->xs);
		return $out;
	}

	/* 
	 * Returns the index of the first zero-valued data point. This method is
	 * used to check the tails of hazard curves that often have zero-valued
	 * rates. This could be updated to check for very low values instead, as
	 * some hazard curve generating software could supply "near-zero" values
	 * in lieu of actual zeros. Method assumes that all subsequent values will 
	 * also be zero. Method also ensures that data will have at least 2 values.
	 */
	private function firstZeroValue ($data) {
		for ($i = 0; $i < count($data); $i++) {
			if (abs($data[$i]) < 0.00001) {
				break;
			}
		}
		return $i;
	}


}

?>
