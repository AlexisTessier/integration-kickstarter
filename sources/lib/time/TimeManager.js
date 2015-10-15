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

		this.timeUpdateListenerList = [];

		this.timeOutList = [];
	}

	TimeManager.prototype.init = function() {
		var self = this;
		requestAnimationFrame(function requestAnimationFrameEvent() {
			self.frameEvent();
			requestAnimationFrame(requestAnimationFrameEvent);
		});

		return this;
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

		_.each(this.timeUpdateListenerList, function (listener) {
			listener.timeUpdate(self.time);
		});
	};

	TimeManager.prototype.updateTimeOutList = function() {
		var self = this;
		var newTimeOutList = [];

		_.each(this.timeOutList, function (timeOut) {
			timeOut.time += self.getDelta();

			if (timeOut.time < timeOut.duration || timeOut.repeat) {
				newTimeOutList.push(timeOut);
			}

			if (timeOut.time >= timeOut.duration) {
				timeOut.block();
				if (timeOut.repeat) {
					timeOut.time = 0;
				}
			}
		});

		this.timeOutList = newTimeOutList;
	};

	TimeManager.prototype.addTimeLoop = function(duration, block) {
		var timeLoop = {
			time : 0,
			duration : duration,
			block : block,
			repeat : true
		};

		this.timeOutList.push(timeLoop);

		return timeLoop;
	};

	TimeManager.prototype.addTimeUpdateListener = function(listener) {
		if (!_.isFunction(listener.timeUpdate)) {
			throw new Error('A time update listener for a TimeManager must have a method timeUpdate')
		};
		this.timeUpdateListenerList.push(listener);
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
		var timeOut = {
			time : 0,
			duration : duration,
			block : block,
			repeat : false
		};

		this.timeOutList.push(timeOut);

		return timeOut;
	};

	return TimeManager;
}());