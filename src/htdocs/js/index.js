/* global APP_CONFIG */
'use strict';

var RTGMApplication = require('rtgm/RTGMApplication'),
    FoxPlazaPreload = require('FoxPlazaPreload');


  new RTGMApplication({
    el: document.querySelector('#application'),
    baseUrl: APP_CONFIG.MOUNT_PATH
  });

  FoxPlazaPreload.load();
