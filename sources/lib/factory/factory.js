var factory = (function() {
	'use strict';

	var factory = {};

	factory.create = {};

	factory.dependencyList = {};

	factory.create.component = function factoryCreateComponent(_constructor, node) {
		if(_.isString(_constructor)){
			_constructor = factory.dependencyList[_constructor];
		}

		if (node) {
			var component = new _constructor(node);

			if (_.isFunction(_constructor.getDependencyList)) {
				var dependencyList = _constructor.getDependencyList();
				
				_.forEach(dependencyList, function (dependencyName) {
					if (!_.contains(_.keys(factory.dependencyList), dependencyName)) {
						throw new Error ('The component constructor '+_constructor.name+' needs an undefined dependency named "'+dependencyName+'".');
					}

					component[dependencyName] = factory.dependencyList[dependencyName];
				});
			}

			if (_.isFunction(_constructor.getDataPropertyList)) {
				var dataPropertyList = _constructor.getDataPropertyList();
				
				_.forEach(dataPropertyList, function (propertyDefaultValue, propertyName) {
					var dataset = component.node.dataset;

					var componentPropertyValue = component[propertyName] = _.contains(_.keys(dataset), propertyName) ? dataset[propertyName] : propertyDefaultValue;

					if (_.isBoolean(propertyDefaultValue)) {
						component[propertyName] = (componentPropertyValue === true || componentPropertyValue === "true" || componentPropertyValue === 'data-'+_.kebabCase(propertyName)) ? true : false;
					}
				});
			}

			if (_.isFunction(_constructor.getEventListenerList)) {
				var eventListenerList = _constructor.getEventListenerList();

				_.forEach(eventListenerList, function (eventListenerDescription) {
					var explodeOne = eventListenerDescription.split ('->'),
						explodeTwo = explodeOne[0].split('.'),
						explodeThree = explodeTwo[1].split('('),
						explodeFour = explodeThree[1].replace(')', '').split(','),

						target = _.trim(explodeTwo[0]),

						method = _.trim(explodeOne[1]),

						eventName = _.trim(explodeThree[0]),

						optionList = _.map(explodeFour, function (value) {
							return _.trim(value);
						});

					var subcomponent_targetNode = component[target];

					var targetNodeList = [];

					if (_.isFunction(subcomponent_targetNode.addEventListener)) {
						targetNodeList.push(subcomponent_targetNode);
					}
					else{
						dom.forEach(subcomponent_targetNode, function (node) {
							targetNodeList.push(node);
						});
					}

					_.forEach(targetNodeList, function (targetNode) {
						targetNode.addEventListener(eventName, function (event) {
							if (_.contains(optionList, 'preventDefault')) {
								event.preventDefault();
							}

							if (_.contains(optionList, 'blur')) {
								targetNode.blur();
							}

							component[method](event);
						});
					});
				});
			}

			return component;
		}
		return null;
	};

	factory.create.component.init = function (_constructor, node) {
		var component = factory.create.component(_constructor, node);
		if (component) {
			component.init();
		}
		return component;
	};

	factory.forEach = function (nodeList) {
		var innerFactory = {};

		innerFactory.create = {};
			
		innerFactory.create.component = function (_constructor) {
			var componentList = [];

			dom.forEach(nodeList, function (node) {
				var component = factory.create.component(_constructor, node);

				if (component) {
					componentList.push(component);
				}
			});

			return componentList;
		};

		innerFactory.create.component.init = function (_constructor) {
			var componentList = innerFactory.create.component(_constructor);

			_.forEach(componentList, function (component) {
				component.init();
			});

			return componentList;
		};

		return innerFactory;
	};

	factory.setDependency = function factorySetDependency(dependencyName, value) {
		factory.dependencyList[dependencyName] = value;
	};

	return factory;
}());