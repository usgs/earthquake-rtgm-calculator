<?php

/**
 * Wrapper class for fragility curve data.
 */
class FragilityCurve {

  // Probability on fragility curve at RTGM
  const FRAGILITY_AT_RTGM = 0.1;

  public $median;

  private $beta;
  private $cdf=null;
  private $model;
  private $pdf=null;

  public function __construct ($rtgm, $model, $beta) {
    $this->median = $rtgm / exp(RTGM_Util::norminv(self::FRAGILITY_AT_RTGM)
        * $beta);
    $this->model = $model;
    $this->beta = $beta;
  }

  public function getPdf () {
    if ($this->pdf == null) {
      $size = count($this->model->xs);
      $this->pdf = new XY_Series($size);
      for ($i = 0; $i < $size; $i++) {
        $this->pdf->xs[$i] = $this->model->xs[$i];
        $this->pdf->ys[$i] = RTGM_Util::logNormalDensity(
            $this->model->xs[$i], log($this->median), $this->beta);
      }
    }
    return $this->pdf;
  }

  public function getCdf () {
    if ($this->cdf == null) {
      $size = count($this->model->xs);
      $this->cdf = new XY_Series($size);
      for ($i = 0; $i < $size; $i++) {
        $this->cdf->xs[$i] = $this->model->xs[$i];
        $this->cdf->ys[$i] = RTGM_Util::logNormalCumProb(
            $this->model->xs[$i], log($this->median), $this->beta);
      }
    }
    return $this->cdf;
  }

}

?>
