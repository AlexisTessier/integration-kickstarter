var KeyboardManager = (function() {
	'use strict';

	function KeyboardManager(params) {
		// enforces new
		if (!(this instanceof KeyboardManager)) {
			return new KeyboardManager(params);
		}
		this.target = $(params.target);

		this.keyboardEventList = [];
	}

	KeyboardManager.prototype.init = function() {
		var self = this;

		this.target.keypress(function (event) {
			self.keyboardEvent(self.getKeyObjectFromEvent(event, 'press'));
		});

		this.target.keyup(function (event) {
			self.keyboardEvent(self.getKeyObjectFromEvent(event, 'up'))
		});

		this.target.keydown(function (event) {
			self.keyboardEvent(self.getKeyObjectFromEvent(event, 'down'))
		});

		return this;
	};

	KeyboardManager.prototype.getKeyObjectFromEvent = function(event, type) {
		var keyObject = {
			character : String.fromCharCode(event.charCode),
			code : event.keyCode,
			event : event
		};

		keyObject[type] = true;

		keyObject.arrow = {};

		var arrowKeyCode = KeyboardManager.arrowKeyCode;

		for(var arrow in arrowKeyCode){
			keyObject.arrow[arrow] = keyObject.code === arrowKeyCode[arrow];
		};

		keyObject.touch = {};

		var touchKeyCode = KeyboardManager.touchKeyCode;

		for(var touch in touchKeyCode){
			keyObject.touch[touch] = keyObject.code === touchKeyCode[touch];
		};

		return keyObject;
	};

	KeyboardManager.prototype.keyboardEvent = function(key) {
		_.forEach(this.keyboardEventList, function (keyboardEvent) {
			keyboardEvent(key);
		});
	};

	KeyboardManager.prototype.addKeyboardEvent = function(block) {
		this.keyboardEventList.push(block);
	};

	KeyboardManager.arrowKeyCode = {
		left : 37,
		up : 38,
		right : 39,
		down : 40
	};

	KeyboardManager.touchKeyCode = {
		space : 32
	};

	return KeyboardManager;
}());