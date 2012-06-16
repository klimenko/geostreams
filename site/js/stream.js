(function($, geo) {

/* Utilities */

$.extend({
	foldl: function(acc, obj, callback) {
		$.each(obj, function(key, item) {
			var result = callback(item, acc, key);
			if (result !== undefined) acc = result;
		});
		return acc;
	}
});

/* /Utilities  */

GeoStream = function(config) {
	if (!(config && config.target)) return;
	this.config = $.extend(true, {
		apiURL: "http://search.twitter.com/",
		cdnURL: ""
	}, config);
	this.init(config.data);
};

GeoStream.prototype = {
	constructor: GeoStream,
	init: function(data) {
		this.getGeoLocation(function(data) {
			this.apiCall("search.json", {
				q: "",
				rpp: 100,
				geocode: data.coords.latitude + "," + data.coords.longitude + ",10mi"
			}, function(response) {
				this.config.target.append(this.constructItems(response.results));
			}.bind(this));
		}.bind(this));
	},
	constructItems: function(items) {
		return $.foldl($('<div class="geo-stream-wrapper"></div'), items, function(item, container) {
			var row = $('<div class="row">' +
				'<div class="span6 offset3">' +
					'<div class="hero-unit geo-stream-item-overlay">' +
						'<div class="geo-stream-item">' +
							'<div class="geo-stream-item-avatar">' +
								'<img src="'+ item.profile_image_url +'">' +
							'</div>' +
							'<div class="geo-stream-item-content">' +
								'<div class="geo-stream-item-userName">'+ item.from_user_name + ' ( ' + item.from_user + ' )</div>' +
								'<div class="geo-stream-item-text">'+ item.text + '</div>' +
							'</div>' +
							'<div class="geo-stream-clear"></div>' +
						'</div>' +
					'</div>' +
				'</div>' +
			'</div>').appendTo(container);
		});
	},
	getGeoLocation: function(callback) {
		geo.getCurrentPosition(callback);
	},
	apiCall: function(endpoint, params, callback) {
		var config = this.config;
		$.get(config.apiURL + endpoint, params || {}, callback, "jsonp");
	}
};	
})(jQuery, navigator.geolocation);
