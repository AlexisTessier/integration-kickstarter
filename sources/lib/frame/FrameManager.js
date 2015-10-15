var FrameManager = (function() {
	'use strict';

	function FrameManager(params) {
		// enforces new
		if (!(this instanceof FrameManager)) {
			return new FrameManager(params);
		}
		this.frame = $(params.frame);
		this.timeManager = params.timeManager;

		this.resize = {
			both : false,
			width : false,
			height : false,
			one : false
		};

		this.size = {
			width : this.frame.width(),
			height : this.frame.height()
		};

		this.resizeListenerList = [];
	}

	FrameManager.prototype.init = function() {
		if (this.timeManager) {
			this.timeManager.addTimeUpdateListener(this);
		};

		this.update();

		return this;
	};

	FrameManager.prototype.update = function() {
		var newWidth = this.getWidth(),
			newHeight = this.getHeight();

		this.resize.width = (newWidth != this.size.width);
		this.resize.height = (newHeight != this.size.height);
		this.resize.both = (this.resize.width && this.resize.height);
		this.resize.one = (this.resize.width || this.resize.height);

		this.size.width = newWidth;
		this.size.height = newHeight;

		if (this.resize.one) {
			this.resizeEvent();
		}
	};

	FrameManager.prototype.timeUpdate = FrameManager.prototype.update;

	FrameManager.prototype.resizeEvent = function(documentResize) {
		var self = this;

		_.each(this.resizeListenerList, function (resizeListener) {
			resizeListener.resize(self.getRect());
		});
	};

	FrameManager.prototype.addResizeListener = function(listener) {
		if (!_.isFunction(listener.resize)) {
			throw new Error('A resize listener for a FrameManager must have a method resize')
		};
		
		this.resizeListenerList.push(listener);
	};

	FrameManager.prototype.getRect = function() {
		return {
			resize : this.resize,
			size : this.size
		};
	};

	FrameManager.prototype.setHeight = function(newHeight) {
		this.frame.height(newHeight);
	};

	FrameManager.prototype.setWidth = function(newWidth) {
		this.frame.width(newWidth);
	};

	FrameManager.prototype.getHeight = function() {
		return this.frame.height();
	};

	FrameManager.prototype.getWidth = function() {
		return this.frame.width();
	};

	return FrameManager;
}());