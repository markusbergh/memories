/*
 * T A M M - Contact
 * This file contains the about section
 *
 * Usage: var about = new About(elem, {});
 *
 * Author
 * Markus Bergh, 2014
 */

define([
		'jquery',
		'transit'
	],

    function($, transit) {

		/*
		 * Constructor
		 */
		var Contact = function(elem, options) {
			this.elem = elem;
			this.$elem = $(elem);
			this.options = options;

			// This next line takes advantage of HTML5 data attributes
			// to support customization of the plugin on a per-element
			// basis. For example,
			// <div class=item" data-plugin-options="{"message":"Goodbye World!"}"></div>
			this.metadata = this.$elem.data( "plugin-options" );
		};

		/*
		 * Prototype
		 */
		Contact.prototype = {
			defaults: {

			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				return self;
			},

            create: function() {
            	var self = this;

            	var information = $('<p>Still wondering if I would like to be reached or not.</p>');

				if(self.config.onReady != null) {
					self.config.onReady(information);
				}

				return  self;
            }
		};

		/*
		 * Defaults
		 */
		Contact.defaults = Contact.prototype.defaults;

		$.fn.Contact = function(options) {
			return this.each(function() {
				new Contact(this, options).init();
			});
		};

		return Contact;
	}
);