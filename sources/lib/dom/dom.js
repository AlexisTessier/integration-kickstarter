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

	dom.select = function (id) {
		return document.getElementById(id);
	};
	
	return dom;
}());