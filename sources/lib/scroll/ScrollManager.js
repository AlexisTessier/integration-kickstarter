var ScrollManager = (function() {
	'use strict';

	function ScrollManager(params) {
		// enforces new
		if (!(this instanceof ScrollManager)) {
			return new ScrollManager(params);
		}

		this.document = $(params.document);
		this.timeManager = params.timeManager;
		this.frame = params.frame;

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
	}

	ScrollManager.prototype.init = function() {
		var self = this;
		this.timeManager.addFrameEvent(function (time) {
			self.update(time);
		});

		this.update(this.timeManager.time);

		return this;
	};

	ScrollManager.prototype.update = function(time) {
		var newScrollPosition = this.document.scrollTop();

		this.scroll.toDown = (newScrollPosition > this.scroll.position);
		this.scroll.toUp = (newScrollPosition < this.scroll.position);
		this.scroll.change = (this.scroll.toUp || this.scroll.toDown);

		this.scroll.change ? this.scroll.timeSinceLastChange = 0 : this.scroll.timeSinceLastChange += time.delta;
		this.scroll.toUp ? this.scroll.timeSinceLastChangeToUp = 0 : this.scroll.timeSinceLastChangeToUp += time.delta;
		this.scroll.toDown ? this.scroll.timeSinceLastChangeToDown = 0 : this.scroll.timeSinceLastChangeToDown += time.delta;


		if(this.frame.resize.both){
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