var require = {
	paths: {
		jquery: './vendor/jquery-1.10.1.min',
		transit: './vendor/jquery.transit-0.9.9.min',
		snapsvg: './vendor/snap.svg-0.2.0.min'
	},
	shim: {
		'snapsvg': {
			exports: 'Snap'
		}
	}
};