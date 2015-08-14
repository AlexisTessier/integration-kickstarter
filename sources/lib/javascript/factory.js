var factory = (function() {
	'use strict';

	var factory = {};

	factory.create = {};

	factory.create.forEach = function ($elList) {
		return {
			component : function (_constructor) {
				var componentList = [];
				$elList.each(function(index, el) {
					componentList.push(factory.create.component(_constructor, $(el)));
				});

				return componentList;
			}
		};
	};

	factory.create.component = function (_constructor, $el) {
		if ($el.size()) {
			return new _constructor($el);
		}
		return null;
	};

	return factory;
}());