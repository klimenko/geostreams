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

var calcAge = function(format) {
	var when;
	var d = new Date(format);
	var now = $.now();
	var diff = Math.floor((now - d.getTime()) / 1000);
	var dayDiff = Math.floor(diff / 86400);
	var getAgo = function(ago, period) {
		return ago + " " + period + (ago == 1 ? "" : "s") + " Ago";
	};
	if (isNaN(dayDiff) || dayDiff < 0 || dayDiff >= 365) {
		when = d.toLocaleDateString() + ', ' + d.toLocaleTimeString();
	} else if (diff < 60) {
		when = getAgo(diff, 'Second');
	} else if (diff < 60 * 60) {
		diff = Math.floor(diff / 60);
		when = getAgo(diff, 'Minute');
	} else if (diff < 60 * 60 * 24) {
		diff = Math.floor(diff / (60 * 60));
		when = getAgo(diff, 'Hour');
	} else if (diff < 60 * 60 * 48) {
		when = "Yesterday";
	} else if (dayDiff < 7) {
		when = getAgo(dayDiff, 'Day');
	} else if (dayDiff < 14) {
		when = "Last Week";
	} else if (dayDiff < 30) {
		diff =  Math.floor(dayDiff / 7);
		when = getAgo(diff, 'Week');
	} else if (dayDiff < 60) {
		when = "Last month";
	} else if (dayDiff < 365) {
		diff =  Math.floor(dayDiff / 31);
		when = getAgo(diff, 'Month');
	}
	return when;
};

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
		this.getGeoLocation($.proxy(function(data) {
			this.apiCall("search.json", {
				q: "",
				rpp: 100,
				geocode: data.coords.latitude + "," + data.coords.longitude + ",10mi"
			}, $.proxy(function(response) {
				this.config.target.append(this.constructItems(response.results));
			}, this));
		}, this));
	},
	constructItems: function(items) {
		return $.foldl($('<div class="geo-stream-wrapper"></div'), items, function(item, container) {
		var age = calcAge(item.created_at);
		var row = $('<div class="row">' +
				'<div class="span6 offset3">' +
					'<div class="hero-unit geo-stream-item-overlay">' +
						'<div class="geo-stream-item">' +
							'<div class="geo-stream-item-avatar">' +
								'<img src="'+ item.profile_image_url +'">' +
							'</div>' +
							'<div class="geo-stream-item-content">' +
								'<div class="geo-stream-item-userName">'+ item.from_user_name + ' ( ' + item.from_user + ' )<span class="geo-stream-item-age">'+ age +'</span></div>' +
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
