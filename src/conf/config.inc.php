<?php

// set default timezone
date_default_timezone_set('UTC');


// read configuration
$CONFIG = parse_ini_file('config.ini');
$APP_DIR = $CONFIG['APP_DIR'];
$DATA_DIR = $CONFIG['DATA_DIR'];
$MOUNT_PATH = $CONFIG['MOUNT_PATH'];


include_once $APP_DIR . DIRECTORY_SEPARATOR . 'lib' . DIRECTORY_SEPARATOR .
		'lib.inc.php';
?>
