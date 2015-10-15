function currentPageIs(pageIdentifier) {
	var pageIdentifiedList = dom.selectOne(['[data-page-identifier]']);

	return pageIdentifiedList.dataset.pageIdentifier === pageIdentifier;
}

function getScriptManager () {
	if (!window.app.scriptManager) {
		window.app.scriptManager = {
			pageScript : {},
			register : function register(scriptIdentifier, block, args) {
				window.app.scriptManager.pageScript[scriptIdentifier] = {
					block : block,
					args : args
				};
			},
			registerLibScript : function (libIdentifier, block, args) {
				window.app.scriptManager.register(_.kebabCase('lib-'+libIdentifier), block, args);
			},
			registerPageScript : function (pageIdentifier, block, args) {
				var args = _.isArray(args) ? args : [];
				var pageIdentifiedList = dom.select(['[data-page-identifier]']);

				if (pageIdentifiedList.length > 1) {
					throw new Error("You have multiple dom elements with a data-page-identifier attribute.");
				}

				_.forEach(pageIdentifiedList, function (page) {
					if (page.dataset.pageIdentifier === pageIdentifier){
						args.unshift(page);
						window.app.scriptManager.register(_.kebabCase('page-'+pageIdentifier), block, args);
					}
				});
			},
			execute : function execute(scriptIdentifier, args) {
				var script = window.app.scriptManager.pageScript[scriptIdentifier];

				if (script && _.isFunction(script.block)) {
					var args = _.isArray(args) ? args : script.args;

					if (_.isArray(args)) {
						script.block.apply(null, args);
					}
					else{
						script.block();
					}
				}
			},
			executeAll : function executeAll(args) {
				for(var scriptIdentifier in window.app.scriptManager.pageScript){
					window.app.scriptManager.execute(scriptIdentifier, args);
				}
			}
		};
	}

	return window.app.scriptManager;
}

window.layoutDefaultScript = function () {
	getScriptManager();

	dom.select('html')[0].classList.remove('no-js');

	dom.ready(function () {
		window.app.main();
	});
};