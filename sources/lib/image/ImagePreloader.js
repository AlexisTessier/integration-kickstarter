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
				var tabletImageUrl = $el.data('tablet-background-image-to-load') || imageUrl;
				var mobileImageUrl = $el.data('mobile-background-image-to-load') || imageUrl;

				/*if (tabletImageUrl === imageUrl || tabletImageUrl === mobileImageUrl || tabletImageUrl === mobileImageUrl) {
					console.log($el.attr('class'));
				}*/

				self.register({
					$el : $el,
					imageUrl : imageUrl,
					tabletImageUrl : tabletImageUrl,
					mobileImageUrl : mobileImageUrl
				});
		});
	};

	ImagePreloader.prototype.register = function(targetToLoad) {
		var targetID = 'background-image-to-load-'+preloadCount;
		targetToLoad.ID = targetID;

		targetToLoad.imageUrl = ImagePreloader.getFullUrl(targetToLoad.imageUrl);
		targetToLoad.tabletImageUrl = ImagePreloader.getFullUrl(targetToLoad.tabletImageUrl);
		targetToLoad.mobileImageUrl = ImagePreloader.getFullUrl(targetToLoad.mobileImageUrl);

		this.indexedTarget[targetID] = targetToLoad;

		preloadCount++;
	};

	ImagePreloader.prototype.loadAndPerforms = function(block) {
		for(var key in this.indexedTarget){
			ImagePreloader.setBackgroundImageForTarget(this.indexedTarget[key], /*forceMobile*/true);
		}

		app.deviceManager.addChangeListener(this);

		if(typeof block === "function"){
			block();
		}
	};

	ImagePreloader.prototype.deviceChange = function() {
		for(var key in this.indexedTarget){
			ImagePreloader.setBackgroundImageForTarget(this.indexedTarget[key]);
		}
	};

	ImagePreloader.setBackgroundImageForTarget = function (target, forceMobile) {
		if (app.deviceManager.is('mobile') || forceMobile) {
			target.$el.css('background-image', 'url("'+target.mobileImageUrl+'")');
		}
		else if(app.deviceManager.is('tablet')){
			target.$el.css('background-image', 'url("'+target.tabletImageUrl+'")');
		}
		else{
			target.$el.css('background-image', 'url("'+target.imageUrl+'")');
		}
	};

	ImagePreloader.getFullUrl = function (baseUrl) {
		return baseUrl.indexOf('http') === 0 ? baseUrl : window.location.origin+baseUrl;
	};

	return ImagePreloader;
}());