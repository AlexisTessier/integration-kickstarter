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