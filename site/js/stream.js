(function($, geo) {

/* Utilities */

$.extend({
	foldl: function(acc, obj, callback) {
		$.each(object, function(key, item) {
			result = callback(item, acc, key);
			if (result !== undefined) acc = result;
		});
		return acc;
	}
});

/* /Utilities  */

GeoStream = function(config) {
	if (!(config && config.target)) return;
	config = $.extend(true, {
		apiURL: "",
		cdnURL: ""
	}, config);
	this.init(config.data);
};

GeoStream.prototype = {
	constructor: GeoStream,
	init: function(data) {
		this.getGeoLocation();
	},
	constructItems: function(items) {
		return $.foldl($('<div class=""></div'), items, function(item, container) {
			
		});
	},
	getGeoLocation: function() {
		geo.getCurrentPosition(function(data) {console.log(data);});
	},
	apiCall: function(endpoint, params, callback) {
		var config = this.config;
		$.get(config.apiURL, params || {}, callback, "jsonp");
	}
};	
})(jQuery, navigator.geolocation);
