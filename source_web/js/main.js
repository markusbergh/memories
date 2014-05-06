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
		window.Z_INDEX_NAV_TOGGLE = 699;
		window.Z_INDEX_SECTION = 599;
		window.Z_INDEX_TRANSITION = 499;

		// Kickstart application
		var app = new CoreApp().initialize();

		// Add class for script support
		$('html').removeClass('no-js').addClass('js');
	});

});