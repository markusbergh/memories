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
		// Kickstart application
		var app = new CoreApp().initialize();

		// Add class for script support
		$('html').removeClass('no-js').addClass('loaded-and-ready js');
	});

});