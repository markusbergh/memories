/*
 * Main
 * This file contains the main script for site
 *
 * Author
 * Markus Bergh
 * 2014
 */

require(['jquery', './tamm/tamm__App'], function($, CoreApp) {

	$(function() {

		// Defaults
		window.Z_INDEX_NAV_TOGGLE = 499;
		window.Z_INDEX_SECTION = 399;
		window.Z_INDEX_TRANSITION = 299;

		// Kickstart application
		var app = new CoreApp().initialize();

		// Add class for script support
		$('html').removeClass('no-js').addClass('js');
	});

});