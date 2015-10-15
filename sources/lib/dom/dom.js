var dom = (function() {
	'use strict';

	var dom = {};

	dom.ready = function domReady(callback) {
		if (document.readyState != 'loading'){
			callback();
		}
		else {
			document.addEventListener('DOMContentLoaded', callback);
		}
	};

	dom.selectById = function domSelectById(id) {
		return document.getElementById(id);
	};

	dom.select = function domSelect(selector) {
		return document.querySelectorAll(selector);
	};

	dom.selectOne = function domSelectOne(selector) {
		return dom.select(selector)[0];
	};

	dom.forEach = function domForEach(nodeList, block) {
		for(var i = 0, imax = nodeList.length;i<imax;i++){
			block(nodeList.item(i), i);
		}
	};

	dom.getStyle = function domGetStyle(element) {
		return window.getComputedStyle(element);
	};
	
	return dom;
}());