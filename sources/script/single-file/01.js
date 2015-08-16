var DeviceManager = (function() {
	'use strict';

	function DeviceManager(params) {
		// enforces new
		if (!(this instanceof DeviceManager)) {
			return new DeviceManager(params);
		}

		this.frame = params.$frame;
		this.timeManager = params.timeManager;

		this.resize = {
			both : false,
			width : false,
			height : false,
			every : false
		};

		this.size = {
			width : this.frame.width(),
			height : this.frame.height()
		};

		this.document = $(document);

		this.documentSize = {
			height : this.document.height(),
			width : this.document.width()
		};

		this.deviceList = [];

		this.indexedDevice = {};
		this.indexedDeviceList = {};
		this.resizeEventList = [];
		this.resizeEventListWithDocument = [];

		this.deviceChanged = false;

		this.firstDeviceSetted = false;

		this.init();
	}

	DeviceManager.prototype.init = function() {
		var self = this;
		this.timeManager.addFrameEvent(function () {
			self.update();
		});

		this.update();
		this.checkCurrentDevice();
	};

	DeviceManager.prototype.changed = function() {
		return this.deviceChanged;
	};

	DeviceManager.prototype.getWidth = function() {
		return this.frame.width();
	};

	DeviceManager.prototype.getHeight = function() {
		return this.frame.height();
	};

	DeviceManager.prototype.update = function() {
		var newWidth = this.getWidth(),
			newHeight = this.getHeight();

		this.resize.width = (newWidth != this.size.width);
		this.resize.height = (newHeight != this.size.height);
		this.resize.both = (this.resize.width && this.resize.height);
		this.resize.one = (this.resize.width || this.resize.height);

		this.size.width = newWidth;
		this.size.height = newHeight;

		var newDocumentWidth = this.document.width();
		var newDocumentHeight = this.document.height();

		var documentResize = (newDocumentHeight !== this.documentSize.height || newDocumentWidth !== this.documentSize.width);

		this.documentSize.height = newDocumentHeight;
		this.documentSize.width = newDocumentWidth;

		if (this.resize.one || !this.firstDeviceSetted) {
			this.checkCurrentDevice();
			this.resizeEvent();

			if (!this.firstDeviceSetted) {
				this.firstDeviceSetted = true;
			}
		}
		else if(documentResize) {
			this.resizeEvent(documentResize);
		}
	};

	DeviceManager.prototype.checkCurrentDevice = function() {
		var self = this;

		var deviceChanged = false;


		_.each(this.deviceList, function (device) {
			var width = self.size.width;
			var height = self.size.height;
			var oldState = self.is(device.name);
			self.unsetDevice(device.name);

			if (width >= device.minWidth && width <= device.maxWidth && height >= device.minHeight && height <= device.maxHeight) {
				self.setDevice(device.name);
			}
			var newState = self.is(device.name);

			deviceChanged = deviceChanged ? true : oldState !== newState;
		});

		this.deviceChanged = deviceChanged;
	};

	DeviceManager.prototype.addDevice = function(name, device) {
		var deviceObject = _.cloneDeep(device);
		deviceObject.name = name;

		this.indexedDeviceList[name] = deviceObject;
		this.deviceList.push(deviceObject);

		this.deviceList = _.sortBy(this.deviceList, 'priority');

		this.update();
		this.checkCurrentDevice();
	};

	DeviceManager.prototype.getDevice = function(name) {
		return typeof name === "string" ? this.indexedDeviceList[name] : this.indexedDeviceList;
	};

	DeviceManager.prototype.unsetDevice = function(deviceName) {
		DeviceManager.dependency.mainHTMLElement.removeClass(deviceName);
		this.indexedDevice[deviceName] = false;
	};

	DeviceManager.prototype.setDevice = function(deviceName) {
		DeviceManager.dependency.mainHTMLElement.addClass(deviceName);
		this.indexedDevice[deviceName] = true;
	};

	DeviceManager.prototype.is = function(deviceName) {
		return !!(this.indexedDevice[deviceName]);
	};

	DeviceManager.prototype.useDefaultDeviceList = function() {
		var self = this;
		_.each(DeviceManager.dependency.defaultDeviceList, function (device, name) {
			self.addDevice(name, device);
		});
	};

	DeviceManager.prototype.resizeEvent = function(documentResize) {
		var self = this;

		var listEvent = documentResize ? this.resizeEventListWithDocument : this.resizeEventList;

		_.each(listEvent, function (resizeEvent) {
			resizeEvent(self.resize);
		});
	};

	DeviceManager.prototype.addResizeEvent = function(block, launchAtDocumentResizeToo) {
		if (launchAtDocumentResizeToo) {
			this.resizeEventListWithDocument.push(block);
		}
		
		this.resizeEventList.push(block);
	};

	DeviceManager.dependency = {
		mainHTMLElement : $('html'),
		defaultDeviceList : {
			desktop : {
				maxWidth : Infinity,
				minWidth : 1025,
				priority : 20,
				maxHeight : Infinity,
				minHeight : 0
			},
			tablet : {
				maxWidth : 1024,
				minWidth : 656,
				priority : 10,
				maxHeight : Infinity,
				minHeight : 0
			},
			mobile : {
				maxWidth : 655,
				minWidth : 0,
				priority : 5,
				maxHeight : Infinity,
				minHeight : 0
			},

			"height-compressed" : {
				maxWidth : Infinity,
				minWidth : 0,
				priority : 4,
				maxHeight : 770,
				minHeight : 581
			},

			"tablet-width-compressed" : {
				maxWidth : 760,
				minWidth : 581,
				priority : 3,
				maxHeight : Infinity,
				minHeight : 0
			},

			"tablet-width-medium-compressed" : {
				maxWidth : 780,
				minWidth : 581,
				priority : 3,
				maxHeight : Infinity,
				minHeight : 0
			},

			'desktop-width-compressed' : {
				maxWidth : 1200,
				minWidth : 1025,
				priority : 2,
				maxHeight : Infinity,
				minHeight : 0
			},

			'desktop-width-compressed-medium' : {
				maxWidth : 1600,
				minWidth : 1025,
				priority : 2,
				maxHeight : Infinity,
				minHeight : 0
			},

			'desktop-width-medium' : {
				maxWidth : 1800,
				minWidth : 1201,
				priority : 2,
				maxHeight : Infinity,
				minHeight : 0
			},

			"height-ultra-compressed" : {
				maxWidth : Infinity,
				minWidth : 0,
				priority : 0,
				maxHeight : 580,
				minHeight : 0
			}
		}
	};

	return DeviceManager;
}());
var dom = (function() {
	'use strict';

	var dom = {};

	dom.ready = function(callback) {
		if (document.readyState != 'loading'){
			callback();
		}
		else {
			document.addEventListener('DOMContentLoaded', callback);
		}
	};
	
	return dom;
}());
var ease = (function() {
	'use strict';

	var ease = {};

	ease.none = function easeNone(t){
		return t;
	};

	ease.linear = function easeLinear(t){
		return t;
	};

	ease.inQuad = function easeInQuad(t){
		return t*t;
	};

	ease.outQuad = function easeOutQuad(t){
		return t*(2.00-t);
	};

	ease.inOutQuad = function easeInOutQuad(t){
		return t<0.50 ? 2.00*t*t : -1.00+(4.00-2.00*t)*t;
	};

	ease.inCubic = function easeInCubic(t){
		return t*t*t;
	};

	ease.outCubic = function easeOutCubic(t){
		return (--t)*t*t+1.00;
	};

	ease.inOutCubic = function easeInOutCubic(t){
		return t<0.50 ? 4.00*t*t*t : (t-1.00)*(2.00*t-2.00)*(2.00*t-2.00)+1.00;
	};

	ease.inQuart = function easeInQuart(t){
		return t*t*t*t;
	};

	ease.outQuart = function easeOutQuart(t){
		return 1-(--t)*t*t*t;
	};

	ease.inOutQuart = function easeInOutQuart(t){
		return t<0.50 ? 8.00*t*t*t*t : 1.00-8.00*(--t)*t*t*t;
	};

	ease.inQuint = function easeInQuint(t){
		return t*t*t*t*t;
	};

	ease.outQuint = function easeOutQuint(t){
		return 1.00+(--t)*t*t*t*t;
	};

	ease.inOutQuint = function easeInOutQuint(t){
		return t<0.50 ? 16.00*t*t*t*t*t : 1.00+16.00*(--t)*t*t*t*t;
	};

	return ease;
}());
var factory = (function() {
	'use strict';

	var factory = {};

	factory.create = {};

	factory.create.forEach = function ($elList) {
		return {
			component : function (_constructor) {
				var componentList = [];
				$elList.each(function(index, el) {
					componentList.push(factory.create.component(_constructor, $(el)));
				});

				return componentList;
			}
		};
	};

	factory.create.component = function (_constructor, $el) {
		if ($el.size()) {
			return new _constructor($el);
		}
		return null;
	};

	return factory;
}());
var ImagePreloader = (function() {
	'use strict';

	var preloadCount = 1;

	function ImagePreloader(UILoaderComponent) {
		// enforces new
		if (!(this instanceof ImagePreloader)) {
			return new ImagePreloader(UILoaderComponent);
		}
		
		this.init();

		this.UILoaderComponent = UILoaderComponent;

		this.indexedTarget = {};
	}

	ImagePreloader.prototype.init = function() {

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
var ScrollManager = (function() {
	'use strict';

	function ScrollManager(params) {
		// enforces new
		if (!(this instanceof ScrollManager)) {
			return new ScrollManager(params);
		}

		this.document = params.$document;
		this.timeManager = params.timeManager;

		var self = this;

		this.scroll = {
			change : false,
			toUp : false,
			toDown : false,
			position : 0,
			timeSinceLastChangeToDown : Infinity,
			timeSinceLastChangeToUp : Infinity,
			timeSinceLastChange : Infinity,
			updated : function () {
				self.update();
				return self.scroll;
			}
		};

		this.scrollEventList = [];

		this.init();
	}

	ScrollManager.prototype.init = function() {
		var self = this;
		this.timeManager.addFrameEvent(function (time) {
			self.update(time);
		});

		this.update(this.timeManager.time);
	};

	ScrollManager.prototype.update = function(time) {
		var newScrollPosition = this.document.scrollTop();

		this.scroll.toDown = (newScrollPosition > this.scroll.position);
		this.scroll.toUp = (newScrollPosition < this.scroll.position);
		this.scroll.change = (this.scroll.toUp || this.scroll.toDown);

		this.scroll.change ? this.scroll.timeSinceLastChange = 0 : this.scroll.timeSinceLastChange += time.delta;
		this.scroll.toUp ? this.scroll.timeSinceLastChangeToUp = 0 : this.scroll.timeSinceLastChangeToUp += time.delta;
		this.scroll.toDown ? this.scroll.timeSinceLastChangeToDown = 0 : this.scroll.timeSinceLastChangeToDown += time.delta;


		if(device.resize.both){
			this.scroll.change = true;
		}

		this.scroll.position = newScrollPosition;

		if (this.scroll.change) {
			this.scrollEvent();
		}
	};

	ScrollManager.prototype.scrollEvent = function() {
		var self = this;

		_.each(this.scrollEventList, function (scrollEvent) {
			scrollEvent(self.scroll);
		});
	};

	ScrollManager.prototype.addScrollEvent = function(block) {
		this.scrollEventList.push(block);
	};

	return ScrollManager;
}());
var TimeManager = (function() {
	'use strict';

	function TimeManager() {
		// enforces new
		if (!(this instanceof TimeManager)) {
			return new TimeManager();
		}

		this.time = {
			start : Date.now(),
			previous : Date.now(),
			delta : 0,
			total : 0
		}

		this.frameEventList = [];

		this.timeOutList = [];

		this.init();
	}

	TimeManager.prototype.init = function() {
		var self = this;
		requestAnimationFrame(function requestAnimationFrameEvent() {
			self.frameEvent();
			requestAnimationFrame(requestAnimationFrameEvent);
		});
	};

	TimeManager.prototype.updateTime = function() {
		var currentTime = Date.now();
		this.time.delta = currentTime - this.time.previous;
		this.time.previous = currentTime;
		this.time.total = currentTime - this.time.start;
	};

	TimeManager.prototype.frameEvent = function() {
		var self = this;

		this.updateTime();
		this.updateTimeOutList();

		_.each(this.frameEventList, function (frameEvent) {
			frameEvent(self.time);
		});
	};

	TimeManager.prototype.updateTimeOutList = function() {
		var self = this;
		var newTimeOutList = [];

		_.each(this.timeOutList, function (timeOut) {
			timeOut.time += self.getDelta();
			if (timeOut.time >= timeOut.duration) {
				timeOut.block();
			}
			else{
				newTimeOutList.push(timeOut);
			}
		});

		this.timeOutList = newTimeOutList;
	};

	TimeManager.prototype.addFrameEvent = function(block) {
		this.frameEventList.push(block);
	};

	TimeManager.prototype.getDelta = function() {
		return this.time.delta;
	};

	TimeManager.prototype.getTotal = function() {
		return this.time.total;
	};

	TimeManager.prototype.performs = function(block) {
		var self = this;
		var performer = function () {
			block();	
		};

		return {
			now : function () {
				performer();
			},
			afterDelay : function (delay) {
				self.addTimeout(delay, performer);
			}
		}
	};

	TimeManager.prototype.addTimeout = function(duration, block) {
		this.timeOutList.push({
			time : 0,
			duration : duration,
			block : block
		});
	};

	return TimeManager;
}());
/*var MyComponent = (function() {
	'use strict';

	function MyComponent(params) {
		// enforces new
		if (!(this instanceof MyComponent)) {
			return new MyComponent(params);
		}
		// constructor body
	}

	MyComponent.prototype.init = function() {
		// method body
	};

	return MyComponent;
}());*/

window.layoutDefaultScript = function () {
	dom.ready(function () {
		window.main();
	});
};

window.main = function main () {
	alert('Hello guy !!!');
};
//# sourceMappingURL=main.min.js.map