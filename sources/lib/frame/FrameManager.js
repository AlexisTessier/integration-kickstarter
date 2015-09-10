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

		this.resizeEventList = [];
	}

	FrameManager.prototype.init = function() {
		var self = this;

		this.timeManager.addFrameEvent(function () {
			self.update();
		});

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

	FrameManager.prototype.resizeEvent = function(documentResize) {
		var self = this;

		var listEvent = this.resizeEventList;

		_.each(listEvent, function (resizeEvent) {
			resizeEvent(self.resize);
		});
	};

	FrameManager.prototype.addResizeEvent = function(block) {
		var self = this;
		
		this.resizeEventList.push(block);

		return {andCall : function () {
			block(self.resize);
		}};
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