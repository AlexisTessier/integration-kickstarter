var factory = (function() {
	'use strict';

	var factory = {};

	factory.create = {};

	factory.create = function (_constructor) {
		var init = false;
		var forEachFunc = function ($elList) {
			var componentList = [];
			$elList.each(function(index, el) {
				componentList.push(factory.create.component(_constructor, $(el), init));
			});

			return componentList;
		};

		return {
			andInit : function () {
				init = true;
				return {
					forEach : forEachFunc
				};
			},
			forEach : forEachFunc
		};
	};

	factory.create.component = function (_constructor, $el, init) {
		if ($el.size()) {
			var component = new _constructor($el);
			if (init) {
				component.init();
			};
			return component;
		}
		return null;
	};

	return factory;
}());