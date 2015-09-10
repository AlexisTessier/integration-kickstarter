var ImagePreloader = (function() {
	'use strict';

	var preloadCount = 1;

	function ImagePreloader(UILoaderComponent) {
		// enforces new
		if (!(this instanceof ImagePreloader)) {
			return new ImagePreloader(UILoaderComponent);
		}
		
		this.UILoaderComponent = UILoaderComponent;

		this.indexedTarget = {};
	}

	ImagePreloader.prototype.init = function() {
		return this;
	};

	ImagePreloader.prototype.registerDefaultImageList = function() {
		this.registerDefaultBackgroundImageList();
	};

	ImagePreloader.prototype.registerDefaultBackgroundImageList = function() {
		var self = this;
		$('[data-background-image-to-load]').each(function(index, el) {
				var $el = $(el);
				var imageUrl = $el.data('background-image-to-load');

				self.register({
					$el : $el,
					imageUrl : imageUrl
				});
		});
	};

	ImagePreloader.prototype.register = function(targetToLoad) {
		var targetID = 'background-image-to-load-'+preloadCount;
		targetToLoad.ID = targetID;

		targetToLoad.imageUrl = ImagePreloader.getFullUrl(targetToLoad.imageUrl);

		this.indexedTarget[targetID] = targetToLoad;

		preloadCount++;
	};

	ImagePreloader.prototype.loadAndPerforms = function(block) {
		for(var key in this.indexedTarget){
			var target = this.indexedTarget[key];

			target.$el.css('background-image', 'url("'+target.imageUrl+'")');
		}

		this.indexedTarget = {};

		block();
	};

	ImagePreloader.getFullUrl = function (baseUrl) {
		return baseUrl.indexOf('http') === 0 ? baseUrl : window.location.origin+'/'+baseUrl;
	};

	return ImagePreloader;
}());