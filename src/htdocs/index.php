<?php
if (!isset($TEMPLATE)) {
  include_once '../conf/config.inc.php';

  $TITLE = 'Risk Targeted Ground Motion Calculator';
  $NAVIGATION = true;
  $HEAD = '
    <link rel="stylesheet" href="css/index.css"/>
  ';
  $FOOT = '
    <script>
      var APP_CONFIG = {MOUNT_PATH: \'' . $MOUNT_PATH . '\'};
    </script>
    <script src="js/dygraph-combined.js"></script>
    <script src="js/index.js"></script>
  ';

  include_once 'template.inc.php';
}
?>

<p class="intro">
  This web application can be used to calculate risk-targeted ground motion
  values in accordance with &ldquo;Method 2&rdquo; of 2010 ASCE 7 Standard
  Section 21.2.1.2. For help using this tool, or for guidance on programmatic
  data access, <a href="https://github.com/usgs/earthquake-rtgm-
calculator/wiki/Risk-Targeted-Ground-Motion-Calculator-Documentation">please
  read the Documentation</a>.
</p>

<div id="application"></div>
