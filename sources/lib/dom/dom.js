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