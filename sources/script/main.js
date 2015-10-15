window.app.main = function main () {
	app.componentList = {};

	app.timeManager = new TimeManager().init();

	app.frameManager = new FrameManager({
		frame : window,
		timeManager : app.timeManager
	}).init();

	app.deviceManager = new DeviceManager({
		frameManager : app.frameManager
	}).init();

	app.scrollManager = new ScrollManager({
		frameManager : app.frameManager,
		timeManager : app.timeManager,
		document : document
	}).init();

	factory.setDependency('timeManager', app.timeManager);
	factory.setDependency('frameManager', app.frameManager);
	factory.setDependency('deviceManager', app.deviceManager);
	factory.setDependency('scrollManager', app.scrollManager);

	/*---------------------------------*/

	app.imagePreloader = new ImagePreloader();

	app.imagePreloader.registerDefaultImageList();

	app.imagePreloader.loadAndPerforms(function () {
		app.scriptManager.executeAll();

		app.frameManager.resizeEvent();
		app.scrollManager.scrollEvent();
	});

	dirtyFix();
};

function dirtyFix () {
	requestAnimationFrame(function () {
		/*buggy left floating element*/
		/*dom.forEach(dom.select(''), function (leftFloating) {
			leftFloating.style.float = 'left';
		});*/
	});
}