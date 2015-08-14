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