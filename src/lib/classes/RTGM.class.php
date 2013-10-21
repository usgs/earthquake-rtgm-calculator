<?php

/**
 * Class for calculating risk-targeted ground motions (RTGM).
 * Implementation is an adaptation of Matlab codes provided by N. Luco.
 */
class RTGM {

	// Logarithmic standard deviation of fragility curve
	const BETA_DEFAULT = 0.6;

	// RTGM iteration limit
	const MAX_ITERATIONS = 6;

	// Minimum spectral acceleration used in resampling
	const MIN_SA = 0.001;

	// Tolerance when comparing calculated risk to target
	const TOLERANCE = 0.01;

	// Resampling interval (used in log space)
	const UPSAMPLING_FACTOR = 1.05;

	public $hazCurve;
	public $riskCoeff = NAN;
	public $rtgm = NAN;
	public $rtgmIters = null;
	public $riskIters = null;
	public $sa = null;

	/* Annual frequency of exceedance for Uniform-Hazard Ground Motion (UHGM)
	   UHGM is both denominator of risk coefficient and initial guess for RTGM
	   2% PE 50yrs */
	private $afe4uhgm;

	private $beta = self::BETA_DEFAULT;

	// Target risk in terms of annual frequency
	private $target_risk;

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
		$this->afe4uhgm = -log(1 - 0.02) / 50;
		$this->target_risk = -log(1 - 0.01) / 50;
		$zeroPos = $this->firstZeroValue($ys);
		$this->hazCurve = new XY_Series();
		if ($zeroPos < count($xs)) {
			$this->hazCurve->xs = array_slice($xs, 0, $zeroPos);
			$this->hazCurve->ys = array_slice($ys, 0, $zeroPos);
		} else {
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
	 * Maked the internal iterative RTGM calculation.
	 *
	 * @throws {Exception}
	 *      if internal RTGM calculation exceeds the maximum iterations
	 */
	public function calculate () {
		// uniform hazard ground motion
		$uhgm = RTGM_Util::findLogLogX($this->hazCurve->xs, $this->hazCurve->ys,
				$this->afe4uhgm);

		$this->rtgmIters = array();
		$this->riskIters = array();

		// For adequate discretization of fragility curves...
		$upsampHazCurve = $this->logResample($this->hazCurve, self::MIN_SA,
				self::UPSAMPLING_FACTOR);
		$errorRatio = NAN;

		// Iterative calculation of RTGM
		for ($i = 0; $i < self::MAX_ITERATIONS; $i++) {
			$rtgmTmp;
			$riskTmp;

			if ($i == 0) {
				$rtgmTmp = $uhgm;
			} else if ($i == 1) {
				$rtgmTmp = $this->rtgmIters[0] * $errorRatio;
			} else {
				$rtgmTmp = RTGM_Util::findLogLogY($this->riskIters,
						$this->rtgmIters, $this->target_risk);
			}

			// Generate fragility curve corresponding to current guess for RTGM
			$fc = new FragilityCurve($rtgmTmp, $upsampHazCurve, $this->beta);

			/* Calculate risk using fragility curve generated above & upsampled
			   hazard curve. */
			$riskTmp = $this->riskIntegral($fc->pdf(), $upsampHazCurve);

			// Check risk calculated above against target risk
			$errorRatio = $this->checkRiskAgainstTarget($riskTmp);
			$this->riskIters[] = $riskTmp;
			$this->rtgmIters[] = $rtgmTmp;

			// Exit if ratio of calculated and target risks is within tolerance
			if ($errorRatio == 1) break;

			// If number of iterations has reached specified maximum, exit loop
			if ($i == self::MAX_ITERATIONS) {
				throw new Exception("RTGM: max # iterations reached: " .
						self::MAX_ITERATIONS);
			}
		}

		if ($errorRatio != 1) {
			$this->rtgm = NAN;
		} else {
			$this->rtgm = $this->rtgmIters[count($this->rtgmIters) - 1];
		}
		$this->riskCoeff = $this->rtgm / $uhgm;

		for ($i = 0; $i < count($this->riskIters); $i++) {
			$this->riskIters[$i] = $this->riskIters[$i] / $this->target_risk;
		}
	}

	/*
	 * Compares calculated risk to target risk; returns 1 if within tolerance.
	 */
	private function checkRiskAgainstTarget ($risk) {
		$er = $risk / $this->target_risk; // error ratio
		return abs($er - 1) <= self::TOLERANCE ? 1 : $er;
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
			if ($data[$i] == 0.0) {
				break;
			}
		}
		return $i;
	}

	/*
	 * Resamples hc with supplied interval over min to f.max.
	 */
	private function logResample ($in, $min, $interval) {
		$out = new XY_Series();
		$out->xs = RTGM_Util::buildLogSequence($min,
				$in->xs[count($in->xs) - 1], $interval, true);
		$out->ys = RTGM_Util::findLogLogYArrays($in->xs, $in->ys, $out->xs);
		return $out;
	}

	/*
	 * Evaluates the Risk Integral.
	 *
	 * This method assumes that the fragility PDF is defined at the same
	 * spectral accelerations as the hazard curve (i.e. at HazardCurve.SAs).
	 */
	private function riskIntegral ($fragPDF, $hazCurve) {
		// multiply fragPDF in place
		$fragPDF->ys = RTGM_Util::multiply($fragPDF->ys, $hazCurve->ys);
		return RTGM_Util::trapz($fragPDF->xs, $fragPDF->ys);
	}

}

?>
