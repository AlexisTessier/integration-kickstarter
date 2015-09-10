var WheelManager = (function() {
	'use strict';

	function WheelManager(params) {
		// enforces new
		if (!(this instanceof WheelManager)) {
			return new WheelManager(params);
		}

		WheelManager.mousewheel.install();

		this.timeManager = params.timeManager;
		this.target = $(params.target);
		this.preventDefaultEvent = params.preventDefaultEvent;

		this.wheel = {
			move : 0,
			toUp : false,
			toDown : false,
			change : false,
			timeSinceLastChange : Infinity,
			timeSinceLastChangeToUp : Infinity,
			timeSinceLastChangeToDown : Infinity,
			debounce : function (delay) {
				return {
					toUp : false,
					toDown : false,
					change : false
				};
			}
		}

		this.wheelEventList = [];
	}

	WheelManager.prototype.init = function() {
		var self = this;

		this.target.mousewheel(function(event) {
			if(self.preventDefaultEvent){
				event.preventDefault();
			}
			self.wheel.move += event.deltaY;
		});

		this.timeManager.addFrameEvent(function(time) {
			self.update(time);
		})

		return this;
	};

	WheelManager.prototype.addWheelEvent = function(block) {
		this.wheelEventList.push(block);
	};

	WheelManager.prototype.wheelEvent = function() {
		var self = this;
		_.forEach(this.wheelEventList, function(wheelEvent) {
			wheelEvent(self.wheel);
		});
	};

	WheelManager.prototype.update = function(time) {
		this.wheel.toUp = this.wheel.move > 0;
		this.wheel.toDown = this.wheel.move < 0;
		this.wheel.change = (this.wheel.toUp || this.wheel.toDown);

		var toUp = this.wheel.toUp,
			toDown = this.wheel.toDown,
			change = this.wheel.change,
			timeSinceLastChange = this.wheel.timeSinceLastChange,
			timeSinceLastChangeToUp = this.wheel.timeSinceLastChangeToUp,
			timeSinceLastChangeToDown = this.wheel.timeSinceLastChangeToDown;

		this.wheel.debounce = function (delay) {
			return {
				toUp : (toUp && timeSinceLastChangeToUp >= delay),
				toDown : (toDown && timeSinceLastChangeToDown >= delay),
				change : (change && timeSinceLastChange >= delay)
			};
		};

		this.wheel.change ? this.wheel.timeSinceLastChange = 0 : this.wheel.timeSinceLastChange += time.delta;
		this.wheel.toUp ? this.wheel.timeSinceLastChangeToUp = 0 : this.wheel.timeSinceLastChangeToUp += time.delta;
		this.wheel.toDown ? this.wheel.timeSinceLastChangeToDown = 0 : this.wheel.timeSinceLastChangeToDown += time.delta;

		if (this.wheel.change) {
			this.wheelEvent();
		}

		this.wheel.move = 0;
	};

	WheelManager.mousewheel = {
		installed : false,
		install : function () {
			if (!WheelManager.mousewheel.installed) {
				installMousewheel();
			}
			WheelManager.mousewheel.installed = true;
		}
	};

	return WheelManager;
}());

/*
if (wheel.debounce(100).toDown) {
	this.goToNextSubPart();
}
else if (wheel.debounce(100).toUp) {
	this.goToPreviousSubPart();
}
*/