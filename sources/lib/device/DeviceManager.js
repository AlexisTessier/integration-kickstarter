var DeviceManager = (function() {
	'use strict';

	function DeviceManager(params) {
		// enforces new
		if (!(this instanceof DeviceManager)) {
			return new DeviceManager(params);
		}
		
		this.frameManager = params.frameManager;

		this.changeListenerList = [];

		this.deviceDefinitionMarker = "";

		this.init();
	}

	DeviceManager.prototype.init = function() {
		this.deviceListFrame = $('<div class="device_DeviceManager_deviceListFrame"></div>');
		this.currentDeviceCheckingFrame = $('<div class="device_DeviceManager_currentDeviceCheckingFrame"></div>');
		
		var body = $('body');
		body.append(this.deviceListFrame);
		body.append(this.currentDeviceCheckingFrame);
		this.currentDeviceCheckingFrameInnerFrameList = {};

		this.update();

		this.frameManager.addResizeListener(this);

		return this;
	};

	DeviceManager.prototype.changeEvent = function() {
		var listenerList = this.changeListenerList;
		for(var i=0,imax=listenerList.length;i<imax;i++){
			listenerList[i].deviceChange(this);
		}
	};

	DeviceManager.prototype.addChangeListener = function(listener) {
		if (!_.isFunction(listener.deviceChange)) {
			throw new Error('A change listener for a DeviceManager must have a method deviceChange');
		};
		
		this.changeListenerList.push(listener);
	};

	DeviceManager.prototype.resize = function(){
		this.update();
	}

	DeviceManager.prototype.update = function() {
		this.deviceList = this.getDeviceList();
		this.currentDeviceList = this.getCurrentDeviceList();

		for(var i=0, imax = this.deviceList.length;i<imax;i++){
			var device = this.deviceList[i];
			if (!this.currentDeviceCheckingFrameInnerFrameList[device]) {
				this.currentDeviceCheckingFrame.append(
					this.currentDeviceCheckingFrameInnerFrameList[device] = $('<div class="device_DeviceManager_currentDeviceCheckingFrame-'+device+'"></div>')
				);
			}
			
		}

		var deviceDefinitionMarker = "";
		for(var j=0, jmax=this.currentDeviceList.length;j<jmax;j++){
			deviceDefinitionMarker += "/"+this.currentDeviceList[j];
		}

		if (deviceDefinitionMarker !== this.deviceDefinitionMarker) {
			this.changeEvent();
			this.deviceDefinitionMarker = deviceDefinitionMarker;
		};
	};

	DeviceManager.prototype.getCurrentDeviceList = function() {
		var currentDeviceList = [];
		for(var deviceName in this.currentDeviceCheckingFrameInnerFrameList){
			var deviceInnerFrame = this.currentDeviceCheckingFrameInnerFrameList[deviceName];
			var deviceIsActive = (deviceInnerFrame.first().css('content').replace('"', "").replace('"', "") === "active");
			if (deviceIsActive) {
				currentDeviceList.push(deviceName);
			}
		}
		return currentDeviceList;
	};

	DeviceManager.prototype.getDeviceList = function() {
		var deviceList = this.deviceListFrame.css('content').replace('"', "").replace('"', "").split(',');

		deviceList.pop();

		return deviceList;
	};

	DeviceManager.prototype.is = function(deviceName) {
		return _.contains(this.currentDeviceList, deviceName);
	};

	return DeviceManager;
}());