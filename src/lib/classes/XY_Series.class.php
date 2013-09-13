<?php

/**
 * Wrapper class for X-Y curve data.
 */ 
class XY_Series {

	public xs;
	public xy;

	public function __construct ($size=null) {
		if ($size != null) {
			$this->xs = array($size);
			$this->ys = array($size);
		}
	}
}

?>
