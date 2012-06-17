(function($) {

var parseUrlReg = /^((([^:\/\?#]+):)?\/\/)?([^\/\?#]*)?([^\?#]*)(\?([^#]*))?(#(.*))?/;
var matchDataReg = /{Data:(([a-z]+\.)*[a-z]+)}/ig;

$.extend({
	parseUrl: function(url) {
		var parts = url.match(parseUrlReg);
		return parts ? {
			"scheme": parts[3],
			"domain": parts[4],
			"path": parts[5],
			"query": parts[7],
			"fragment": parts[9]
		} : undefined;
	},
	substitute: function(template, data) {
		return template.replace(matchDataReg, function($0, $1) {
			return data[$1];
		});
	}
});

MediaGallery = function(config) {
	if (!(config && config.target && config.elements && config.elements.length)) return;
	this.config = $.extend(true, {
		"resizeDuration": 250,
		"contextId": null,
		"currentIndex": 0
	}, config);
	this.currentIndex = this.config.currentIndex;
	this.elements = this.config.elements;
	this.construct();
};

MediaGallery.prototype.namespace = "ItemMediaGallery";

MediaGallery.prototype.template = '<div class="mediaGallery-container">' +
	'<div class="mediaGallery-thumbnails">' +
		'<div class="mediaGallery-items"></div>' +
	'</div>' +
	'<div class="mediaGallery-controls"></div>' +
'</div>';

MediaGallery.prototype.mediaFailedTemplate =
	'<span class="mediaGallery-itemErrorLoading"><i>Media is not available now...</i></span>';

MediaGallery.prototype.construct = function(container) {
	var self = this;
	var template = $(this.template);
	var itemsContainer = $(".mediaGallery-items", template);
	var controlsContainer = $(".mediaGallery-controls", template);
	var activeControlClass = 'mediaGallery-activeControl';
	$.each(this.elements, function(i, element) {
		element = $(element);
		self.normalizeFlashContent(element);
		var ratio;
		var isCurrentControl = i == self.currentIndex;
		var itemContainer = $('<div class="mediaGallery-item"></div>').append(element);
		var showCurrentMedia = function() {
			i == self.currentIndex && itemContainer.css("display", "block");
		};
		var controlContainer = $('<a href="#" class="mediaGallery-control"></a>')
		.click(function() {
			var control = $(this);
			var currentItem = itemsContainer.children().eq(self.currentIndex);
			$(".mediaGallery-control", controlsContainer)
				.removeClass(activeControlClass);
			control.addClass(activeControlClass);
			itemsContainer.animate({
				"height": itemContainer.height()
			}, self.config.resizeDuration);
			currentItem.fadeOut(function() {
				itemContainer.fadeIn(function() {
					self.currentIndex = i;
				});
			});
			return false;
		});
		if (isCurrentControl)
			controlContainer.addClass(activeControlClass);
		element.one("error", function() {
			itemContainer.empty().append($.substitute(self.mediaFailedTemplate));
			showCurrentMedia();
		}).one("load", function() {
			self.loadMediaHandler(element, itemContainer);
			showCurrentMedia();
		});
		itemsContainer.append(itemContainer);
		controlsContainer.append(controlContainer);
	});
	if (this.elements.length == 1) controlsContainer.hide();
	$(this.config.target).append(template);
};

// To avoid bugs with flash content when we show/hide it
// we should try fix it with wmode parameter if needed
MediaGallery.prototype.normalizeFlashContent = function(element) {
	var tagName = element.get(0).tagName.toLowerCase();
	if (tagName == "iframe") {
		var parts = $.parseUrl(element.attr("src"));
		if (!/(www\.)?youtube\.com/.test(parts.domain)) return;
		var query = parts.query;
		query = query && ~query.indexOf("wmode")
			? query.replace(/(wmode=)([^&?]+)/g, function($0, $1, $2) {
				if ($2 != "opaque" || $2 != "transparent") {
					return $1 + "opaque";
				}
			})
			: (query
				? (query += "&wmode=opaque")
				: "wmode=opaque"
			)
		;
		parts.path = parts.path || "";
		parts.fragment = parts.fragment ? "#" + parts.fragment : "";
		parts.query = query ? "?" + query : "";
		element.attr("src",	$$.substitute("{Data:scheme}://{Data:domain}{Data:path}{Data:query}{Data:fragment}", parts));
	} else if (tagName == "embed") {
		var wmode = element.attr("wmode");
		if (wmode != "opaque" || wmode != "transparent") {
			element.attr("wmode", "opaque");
		}
	}
};

MediaGallery.prototype.getHiddenElementDimensions = function(parent, element) {
	var dimensions;
	parent.css({
		"postion": "absolute",
		"visibility": "hidden",
		"display": "block"
	});
	dimensions = {
		"width": element.width(),
		"height": element.height()
	};
	parent.css({
		"postion": "",
		"visibility": "",
		"display": ""
	});
	return dimensions;
};

MediaGallery.prototype.loadMediaHandler = function(element, elementContainer) {
	var self = this;
	var target = this.config.target;
	var viewportDimensions = {
		"width": target.width(),
		"height": target.width()
	};
	var getElementDimensions = function() {
		return !elementContainer.is(":visible")
			? self.getHiddenElementDimensions(elementContainer, element)
			: {
				"width": element.width(),
				"height": element.height()
			}
		;
	};
	var elementDimensions = getElementDimensions();
	if (elementDimensions.width > viewportDimensions.width) {
		ratio = viewportDimensions.width / elementDimensions.width;
		element.css({
			"width": viewportDimensions.width,
			"height": elementDimensions.height * ratio
		});
		elementDimensions = getElementDimensions();
	}
	if (elementDimensions.height > viewportDimensions.height) {
		ratio = viewportDimensions.height / elementDimensions.height;
		element.css({
			"width": elementDimensions.width * ratio,
			"height": viewportDimensions.height
		});
	}
};

})(jQuery);
