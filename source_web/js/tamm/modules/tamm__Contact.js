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
				$contact_list: $('<ul />'),
				$contact_list_item: null
			},

			init: function() {
				var self = this;

				// Introduce defaults that can be extended either globally or using an object literal.
				this.config = $.extend({}, this.defaults, this.options, this.metadata);

				return self;
			},

            create: function() {
            	var self = this;

            	var $content = $();

            	self.config.$contact_list.empty();

            	self.config.$contact_list_item = $('<li><a href="mailto:hi@markusbergh.se" target="_blank">Mail</a></li>');
            	self.config.$contact_list.append(self.config.$contact_list_item);

            	self.config.$contact_list_item = $('<li><a href="http://se.linkedin.com/in/markusbergh" target="_blank">LinkedIn</a></li>');
            	self.config.$contact_list.append(self.config.$contact_list_item);

            	self.config.$contact_list_item = $('<li><a href="http://twitter.com/markusbergh/" target="_blank">Twitter</a></li>');
            	self.config.$contact_list.append(self.config.$contact_list_item);

            	self.config.$contact_list_item = $('<li><a href="http://instagram.com/markusbergh/" target="_blank">Instagram</a></li>');
            	self.config.$contact_list.append(self.config.$contact_list_item);

            	$content = $content.add(self.config.$contact_list);

				if(self.config.onReady != null) {
					self.config.onReady($content);
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